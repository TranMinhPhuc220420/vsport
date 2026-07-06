import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';

import PasskeyVerify from '@/components/passkey-verify';
import {
    AuthField,
    AuthPasswordInput,
    StorefrontButton,
} from '@/components/storefront';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    const { t } = useTranslation('auth');

    setLayoutProps({
        title: t('confirmPassword.title'),
        description: t('confirmPassword.description'),
        editorialHeadline: t('confirmPassword.editorialHeadline'),
    });

    return (
        <>
            <Head title={t('confirmPassword.title')} />

            <PasskeyVerify
                routes={{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }}
                label={t('confirmPassword.passkeyLabel')}
                loadingLabel={t('confirmPassword.passkeyLoading')}
                separator={t('confirmPassword.orPassword')}
            />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-5">
                        <AuthField
                            id="password"
                            label={t('confirmPassword.password')}
                            error={errors.password}
                        >
                            <AuthPasswordInput
                                id="password"
                                name="password"
                                placeholder={t(
                                    'confirmPassword.passwordPlaceholder',
                                )}
                                autoComplete="current-password"
                                autoFocus
                                error={errors.password}
                            />
                        </AuthField>

                        <StorefrontButton
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing && (
                                <LoaderCircle className="size-4 animate-spin" />
                            )}
                            {t('confirmPassword.submit')}
                        </StorefrontButton>
                    </div>
                )}
            </Form>
        </>
    );
}
