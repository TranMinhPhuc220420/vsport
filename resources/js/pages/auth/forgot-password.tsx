import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    AuthAlert,
    AuthField,
    AuthInput,
    AuthTextLink,
    StorefrontButton,
} from '@/components/storefront';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    const { t } = useTranslation('auth');

    setLayoutProps({
        title: t('forgotPassword.title'),
        description: t('forgotPassword.description'),
        editorialHeadline: t('forgotPassword.editorialHeadline'),
    });

    return (
        <>
            <Head title={t('forgotPassword.title')} />

            {status && (
                <AuthAlert variant="success" className="mb-6">
                    {status}
                </AuthAlert>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <AuthField
                                id="email"
                                label={t('forgotPassword.email')}
                                error={errors.email}
                            >
                                <AuthInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    placeholder={t(
                                        'forgotPassword.emailPlaceholder',
                                    )}
                                    error={errors.email}
                                />
                            </AuthField>

                            <StorefrontButton
                                type="submit"
                                variant="primary"
                                className="mt-6 w-full"
                                disabled={processing}
                                data-test="email-password-reset-link-button"
                            >
                                {processing && (
                                    <LoaderCircle className="size-4 animate-spin" />
                                )}
                                {t('forgotPassword.submit')}
                            </StorefrontButton>
                        </>
                    )}
                </Form>

                <p className="text-caption-md text-center text-mute">
                    {t('forgotPassword.returnTo')}{' '}
                    <AuthTextLink href={login()}>
                        {t('forgotPassword.logIn')}
                    </AuthTextLink>
                </p>
            </div>
        </>
    );
}
