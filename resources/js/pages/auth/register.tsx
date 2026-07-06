import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    AuthField,
    AuthInput,
    AuthPasswordInput,
    AuthTextLink,
    StorefrontButton,
} from '@/components/storefront';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const { t } = useTranslation('auth');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const passwordsFilled =
        password.length > 0 && passwordConfirmation.length > 0;
    const passwordsMatch = password === passwordConfirmation;

    setLayoutProps({
        title: t('register.pageTitle'),
        description: t('register.description'),
        editorialHeadline: t('register.editorialHeadline'),
        editorialBenefits: [
            t('register.benefit1'),
            t('register.benefit2'),
            t('register.benefit3'),
        ],
    });

    return (
        <>
            <Head title={t('register.title')} />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <AuthField
                                id="name"
                                label={t('register.name')}
                                error={errors.name}
                            >
                                <AuthInput
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder={t('register.namePlaceholder')}
                                    error={errors.name}
                                />
                            </AuthField>

                            <AuthField
                                id="email"
                                label={t('register.email')}
                                error={errors.email}
                            >
                                <AuthInput
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder={t('register.emailPlaceholder')}
                                    error={errors.email}
                                />
                            </AuthField>

                            <AuthField
                                id="password"
                                label={t('register.password')}
                                error={errors.password}
                            >
                                <AuthPasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder={t(
                                        'register.passwordPlaceholder',
                                    )}
                                    passwordrules={passwordRules}
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    error={errors.password}
                                />
                                <p className="text-caption-sm text-mute">
                                    {t('register.passwordRulesHint')}
                                </p>
                            </AuthField>

                            <AuthField
                                id="password_confirmation"
                                label={t('register.confirmPassword')}
                                error={errors.password_confirmation}
                            >
                                <AuthPasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder={t(
                                        'register.confirmPlaceholder',
                                    )}
                                    passwordrules={passwordRules}
                                    value={passwordConfirmation}
                                    onChange={(event) =>
                                        setPasswordConfirmation(
                                            event.target.value,
                                        )
                                    }
                                    error={errors.password_confirmation}
                                />
                                {passwordsFilled && (
                                    <p
                                        className={
                                            passwordsMatch
                                                ? 'text-caption-sm text-success'
                                                : 'text-caption-sm text-sale'
                                        }
                                    >
                                        {passwordsMatch
                                            ? t('register.passwordsMatch')
                                            : t('register.passwordsMismatch')}
                                    </p>
                                )}
                            </AuthField>

                            <StorefrontButton
                                type="submit"
                                variant="primary"
                                className="w-full"
                                tabIndex={5}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing && (
                                    <LoaderCircle className="size-4 animate-spin" />
                                )}
                                {t('register.submit')}
                            </StorefrontButton>
                        </div>

                        <p className="text-center text-caption-md text-mute">
                            {t('register.hasAccount')}{' '}
                            <AuthTextLink href={login()} tabIndex={6}>
                                {t('register.logIn')}
                            </AuthTextLink>
                        </p>
                    </>
                )}
            </Form>
        </>
    );
}
