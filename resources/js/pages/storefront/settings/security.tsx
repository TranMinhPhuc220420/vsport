import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import { AuthField, AuthPasswordInput, StorefrontButton } from '@/components/storefront';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function StorefrontSecuritySettings(props: Props) {
    const { t } = useTranslation('storefront');
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title={t('settings.security.pageTitle')} />

            <div className="space-y-10">
                <section
                    aria-labelledby="security-section-heading"
                    className="space-y-6 border border-hairline p-6"
                >
                    <div>
                        <h2
                            id="security-section-heading"
                            className="text-heading-md text-ink"
                        >
                            {t('settings.security.sectionTitle')}
                        </h2>
                        <p className="text-caption-md mt-1 text-mute">
                            {t('settings.security.sectionDescription')}
                        </p>
                    </div>

                    <Form
                        {...SecurityController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        resetOnError={[
                            'password',
                            'password_confirmation',
                            'current_password',
                        ]}
                        resetOnSuccess
                        onError={(errors) => {
                            if (errors.password) {
                                passwordInput.current?.focus();
                            }

                            if (errors.current_password) {
                                currentPasswordInput.current?.focus();
                            }
                        }}
                        className="space-y-5"
                    >
                        {({ errors, processing }) => (
                            <>
                                <AuthField
                                    id="current_password"
                                    label={t('settings.security.currentPassword')}
                                    error={errors.current_password}
                                >
                                    <AuthPasswordInput
                                        id="current_password"
                                        ref={currentPasswordInput}
                                        name="current_password"
                                        autoComplete="current-password"
                                        placeholder={t(
                                            'settings.security.currentPlaceholder',
                                        )}
                                        error={errors.current_password}
                                    />
                                </AuthField>

                                <AuthField
                                    id="password"
                                    label={t('settings.security.newPassword')}
                                    error={errors.password}
                                >
                                    <AuthPasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        autoComplete="new-password"
                                        placeholder={t(
                                            'settings.security.newPlaceholder',
                                        )}
                                        passwordrules={props.passwordRules}
                                        error={errors.password}
                                    />
                                </AuthField>

                                <AuthField
                                    id="password_confirmation"
                                    label={t('settings.security.confirmPassword')}
                                    error={errors.password_confirmation}
                                >
                                    <AuthPasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        autoComplete="new-password"
                                        placeholder={t(
                                            'settings.security.confirmPlaceholder',
                                        )}
                                        passwordrules={props.passwordRules}
                                        error={errors.password_confirmation}
                                    />
                                </AuthField>

                                <StorefrontButton
                                    type="submit"
                                    variant="primary"
                                    disabled={processing}
                                    className="w-full tablet:w-auto"
                                    data-test="update-password-button"
                                >
                                    {t('settings.security.save')}
                                </StorefrontButton>
                            </>
                        )}
                    </Form>
                </section>

                <section className="border border-hairline p-6">
                    <ManageTwoFactor
                        canManageTwoFactor={props.canManageTwoFactor}
                        requiresConfirmation={props.requiresConfirmation}
                        twoFactorEnabled={props.twoFactorEnabled}
                    />
                </section>

                <section className="border border-hairline p-6">
                    <ManagePasskeys
                        canManagePasskeys={props.canManagePasskeys}
                        passkeys={props.passkeys}
                    />
                </section>
            </div>
        </>
    );
}
