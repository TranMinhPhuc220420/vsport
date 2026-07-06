import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import PasskeyVerify from '@/components/passkey-verify';
import {
    AuthAlert,
    AuthCheckbox,
    AuthField,
    AuthInput,
    AuthPasswordInput,
    AuthTextLink,
    StorefrontButton,
} from '@/components/storefront';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { t } = useTranslation('auth');

    setLayoutProps({
        title: t('login.pageTitle'),
        description: t('login.description'),
        editorialHeadline: t('login.editorialHeadline'),
    });

    return (
        <>
            <Head title={t('login.title')} />

            {status && (
                <AuthAlert variant="success" className="mb-6">
                    {status}
                </AuthAlert>
            )}

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <AuthField
                                id="email"
                                label={t('login.email')}
                                error={errors.email}
                            >
                                <AuthInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder={t('login.emailPlaceholder')}
                                    error={errors.email}
                                />
                            </AuthField>

                            <AuthField
                                id="password"
                                label={t('login.password')}
                                error={errors.password}
                                labelAction={
                                    canResetPassword ? (
                                        <AuthTextLink
                                            href={request()}
                                            tabIndex={5}
                                        >
                                            {t('login.forgotPassword')}
                                        </AuthTextLink>
                                    ) : undefined
                                }
                            >
                                <AuthPasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder={t('login.passwordPlaceholder')}
                                    error={errors.password}
                                />
                            </AuthField>

                            <AuthCheckbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                label={t('login.remember')}
                            />

                            <StorefrontButton
                                type="submit"
                                variant="primary"
                                className="w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && (
                                    <LoaderCircle className="size-4 animate-spin" />
                                )}
                                {t('login.submit')}
                            </StorefrontButton>
                        </div>

                        <p className="text-center text-caption-md text-mute">
                            {t('login.noAccount')}{' '}
                            <AuthTextLink href={register()} tabIndex={5}>
                                {t('login.signUp')}
                            </AuthTextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}
