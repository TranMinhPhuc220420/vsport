import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    AuthAlert,
    AuthTextLink,
    StorefrontButton,
} from '@/components/storefront';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation('auth');

    setLayoutProps({
        title: t('verifyEmail.title'),
        description: t('verifyEmail.description'),
        editorialHeadline: t('verifyEmail.editorialHeadline'),
    });

    return (
        <>
            <Head title={t('verifyEmail.title')} />

            {status === 'verification-link-sent' && (
                <AuthAlert variant="success" className="mb-6">
                    {t('verifyEmail.resent')}
                </AuthAlert>
            )}

            <Form {...send.form()} className="space-y-6">
                {({ processing }) => (
                    <>
                        <StorefrontButton
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={processing}
                        >
                            {processing && (
                                <LoaderCircle className="size-4 animate-spin" />
                            )}
                            {t('verifyEmail.resend')}
                        </StorefrontButton>

                        <p className="text-center">
                            <AuthTextLink href={logout()}>
                                {t('verifyEmail.logOut')}
                            </AuthTextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}
