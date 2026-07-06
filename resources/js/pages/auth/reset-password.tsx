import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    AuthField,
    AuthInput,
    AuthPasswordInput,
    StorefrontButton,
} from '@/components/storefront';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    const { t } = useTranslation('auth');

    setLayoutProps({
        title: t('resetPassword.title'),
        description: t('resetPassword.description'),
        editorialHeadline: t('resetPassword.editorialHeadline'),
    });

    return (
        <>
            <Head title={t('resetPassword.title')} />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-5">
                        <AuthField
                            id="email"
                            label={t('resetPassword.email')}
                            error={errors.email}
                        >
                            <AuthInput
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                readOnly
                                error={errors.email}
                            />
                        </AuthField>

                        <AuthField
                            id="password"
                            label={t('resetPassword.password')}
                            error={errors.password}
                        >
                            <AuthPasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                autoFocus
                                placeholder={t(
                                    'resetPassword.passwordPlaceholder',
                                )}
                                passwordrules={passwordRules}
                                error={errors.password}
                            />
                        </AuthField>

                        <AuthField
                            id="password_confirmation"
                            label={t('resetPassword.confirmPassword')}
                            error={errors.password_confirmation}
                        >
                            <AuthPasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder={t(
                                    'resetPassword.confirmPlaceholder',
                                )}
                                passwordrules={passwordRules}
                                error={errors.password_confirmation}
                            />
                        </AuthField>

                        <StorefrontButton
                            type="submit"
                            variant="primary"
                            className="mt-2 w-full"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && (
                                <LoaderCircle className="size-4 animate-spin" />
                            )}
                            {t('resetPassword.submit')}
                        </StorefrontButton>
                    </div>
                )}
            </Form>
        </>
    );
}
