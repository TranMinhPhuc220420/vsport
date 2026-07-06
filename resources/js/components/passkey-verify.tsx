import type { UrlMethodPair } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { KeyRound, LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AuthDivider, StorefrontButton } from '@/components/storefront';

type Props = {
    routes?: {
        options: UrlMethodPair;
        submit: UrlMethodPair;
    };
    label?: string;
    loadingLabel?: string;
    separator?: string;
};

export default function PasskeyVerify({
    routes,
    label,
    loadingLabel,
    separator,
}: Props = {}) {
    const { t } = useTranslation('auth');
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        ...(routes && {
            routes: {
                options: routes.options.url,
                submit: routes.submit.url,
            },
        }),
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/dashboard');
        },
    });

    if (!isSupported) {
        return null;
    }

    return (
        <>
            <div className="grid gap-2">
                <StorefrontButton
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={verify}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <KeyRound className="size-4" />
                    )}
                    {isLoading
                        ? (loadingLabel ?? t('passkey.authenticating'))
                        : (label ?? t('passkey.signIn'))}
                </StorefrontButton>
                {error && (
                    <p
                        role="alert"
                        className="text-caption-sm text-center text-sale"
                    >
                        {error}
                    </p>
                )}
            </div>

            <AuthDivider label={separator ?? t('passkey.orEmail')} />
        </>
    );
}
