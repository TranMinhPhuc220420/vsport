import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { AuthField } from '@/components/storefront/auth/auth-field';
import { AuthPasswordInput } from '@/components/storefront/auth/auth-password-input';
import { StorefrontButton } from '@/components/storefront/Button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export function DeleteAccountSection() {
    const { t } = useTranslation(['storefront', 'common']);
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <section
            aria-labelledby="delete-account-heading"
            className="space-y-4 border border-hairline p-6"
        >
            <div className="space-y-2">
                <h2
                    id="delete-account-heading"
                    className="text-heading-md text-ink"
                >
                    {t('storefront:settings.deleteAccount.title')}
                </h2>
                <p className="text-caption-md text-mute">
                    {t('storefront:settings.deleteAccount.description')}
                </p>
            </div>

            <div className="space-y-3 rounded-pill-md border border-sale/20 bg-sale/5 p-4">
                <div className="space-y-1">
                    <p className="text-body-strong text-sale">
                        {t('storefront:settings.deleteAccount.warning')}
                    </p>
                    <p className="text-caption-md text-mute">
                        {t('storefront:settings.deleteAccount.caution')}
                    </p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <StorefrontButton
                            type="button"
                            variant="secondary"
                            className="text-sale"
                            data-test="delete-user-button"
                        >
                            {t('storefront:settings.deleteAccount.delete')}
                        </StorefrontButton>
                    </DialogTrigger>
                    <DialogContent className="rounded-none border-hairline bg-canvas sm:max-w-md">
                        <DialogTitle className="text-heading-md text-ink">
                            {t('storefront:settings.deleteAccount.dialogTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-caption-md text-mute">
                            {t(
                                'storefront:settings.deleteAccount.dialogDescription',
                            )}
                        </DialogDescription>

                        <Form
                            {...ProfileController.destroy.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            onError={() => passwordInput.current?.focus()}
                            resetOnSuccess
                            className="space-y-6"
                        >
                            {({ resetAndClearErrors, processing, errors }) => (
                                <>
                                    <AuthField
                                        id="password"
                                        label={t(
                                            'storefront:settings.deleteAccount.password',
                                        )}
                                        error={errors.password}
                                    >
                                        <AuthPasswordInput
                                            id="password"
                                            name="password"
                                            ref={passwordInput}
                                            placeholder={t(
                                                'storefront:settings.deleteAccount.passwordPlaceholder',
                                            )}
                                            autoComplete="current-password"
                                            error={errors.password}
                                        />
                                    </AuthField>

                                    <DialogFooter className="gap-3 sm:gap-3">
                                        <DialogClose asChild>
                                            <StorefrontButton
                                                type="button"
                                                variant="secondary"
                                                onClick={() =>
                                                    resetAndClearErrors()
                                                }
                                            >
                                                {t('common:cancel')}
                                            </StorefrontButton>
                                        </DialogClose>

                                        <StorefrontButton
                                            type="submit"
                                            variant="secondary"
                                            className="text-sale"
                                            disabled={processing}
                                            data-test="confirm-delete-user-button"
                                        >
                                            {t(
                                                'storefront:settings.deleteAccount.delete',
                                            )}
                                        </StorefrontButton>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
}
