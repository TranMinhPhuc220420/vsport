import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ShippingAddressController from '@/actions/App/Http/Controllers/Settings/ShippingAddressController';
import {
    AuthCheckbox,
    AuthField,
    AuthInput,
    StorefrontButton,
} from '@/components/storefront';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from '@/components/ui/dialog';

type AddressItem = {
    id: number;
    label: string | null;
    recipientName: string;
    phone: string;
    addressLine: string;
    isDefault: boolean;
};

type AddressesPageProps = {
    addresses: AddressItem[];
    addressLimit: number;
};

export default function StorefrontAddressesSettings({
    addresses,
    addressLimit,
}: AddressesPageProps) {
    const { t } = useTranslation('storefront');
    const [editing, setEditing] = useState<AddressItem | 'new' | null>(null);
    const [deleting, setDeleting] = useState<AddressItem | null>(null);

    const limitReached = addresses.length >= addressLimit;
    const formProps =
        editing === 'new'
            ? ShippingAddressController.store.form()
            : editing !== null
              ? ShippingAddressController.update.form(editing.id)
              : null;

    return (
        <>
            <Head title={t('settings.addresses.pageTitle')} />

            <div className="space-y-6">
                <section
                    aria-labelledby="addresses-section-heading"
                    className="space-y-6 border border-hairline p-6"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2
                                id="addresses-section-heading"
                                className="text-heading-md text-ink"
                            >
                                {t('settings.addresses.sectionTitle')}
                            </h2>
                            <p className="text-caption-md mt-1 text-mute">
                                {t('settings.addresses.sectionDescription')}
                            </p>
                        </div>

                        <StorefrontButton
                            type="button"
                            variant="secondary"
                            disabled={limitReached}
                            onClick={() => setEditing('new')}
                        >
                            {t('settings.addresses.add')}
                        </StorefrontButton>
                    </div>

                    {limitReached && (
                        <p className="text-caption-sm text-mute">
                            {t('settings.addresses.limitReached')}
                        </p>
                    )}

                    {addresses.length === 0 ? (
                        <p className="text-body-strong text-mute">
                            {t('settings.addresses.empty')}
                        </p>
                    ) : (
                        <ul className="divide-y divide-hairline">
                            {addresses.map((address) => (
                                <li
                                    key={address.id}
                                    className="flex flex-col gap-3 py-5 first:pt-0 tablet:flex-row tablet:items-start tablet:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-body-strong text-ink">
                                                {address.label ||
                                                    address.recipientName}
                                            </p>
                                            {address.isDefault && (
                                                <span className="text-caption-sm rounded-pill-md bg-soft-cloud px-2 py-0.5 text-ink">
                                                    {t(
                                                        'settings.addresses.default',
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-caption-md mt-1 text-mute">
                                            {address.recipientName} ·{' '}
                                            {address.phone}
                                        </p>
                                        <p className="text-caption-md whitespace-pre-wrap text-mute">
                                            {address.addressLine}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 flex-wrap gap-2">
                                        {!address.isDefault && (
                                            <Form
                                                {...ShippingAddressController.setDefault.form(
                                                    address.id,
                                                )}
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                            >
                                                {({ processing }) => (
                                                    <StorefrontButton
                                                        type="submit"
                                                        variant="secondary"
                                                        disabled={processing}
                                                    >
                                                        {t(
                                                            'settings.addresses.makeDefault',
                                                        )}
                                                    </StorefrontButton>
                                                )}
                                            </Form>
                                        )}
                                        <StorefrontButton
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setEditing(address)}
                                        >
                                            {t('settings.addresses.edit')}
                                        </StorefrontButton>
                                        <StorefrontButton
                                            type="button"
                                            variant="secondary"
                                            className="text-sale"
                                            onClick={() => setDeleting(address)}
                                        >
                                            {t('settings.addresses.delete')}
                                        </StorefrontButton>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            <Dialog
                open={editing !== null}
                onOpenChange={(open) => !open && setEditing(null)}
            >
                <DialogContent className="rounded-none border-hairline bg-canvas sm:max-w-md">
                    <DialogTitle className="text-heading-md text-ink">
                        {editing === 'new'
                            ? t('settings.addresses.add')
                            : t('settings.addresses.edit')}
                    </DialogTitle>

                    {formProps && (
                        <Form
                            {...formProps}
                            key={editing === 'new' ? 'new' : editing?.id}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setEditing(null)}
                            className="space-y-5"
                        >
                            {({ errors, processing }) => (
                                <>
                                    <AuthField
                                        id="label"
                                        label={t('settings.addresses.label')}
                                        error={errors.label}
                                    >
                                        <AuthInput
                                            id="label"
                                            name="label"
                                            defaultValue={
                                                editing !== 'new'
                                                    ? (editing?.label ?? '')
                                                    : ''
                                            }
                                            placeholder={t(
                                                'settings.addresses.labelPlaceholder',
                                            )}
                                            error={errors.label}
                                        />
                                    </AuthField>

                                    <AuthField
                                        id="recipientName"
                                        label={t(
                                            'settings.addresses.recipientName',
                                        )}
                                        error={errors.recipientName}
                                    >
                                        <AuthInput
                                            id="recipientName"
                                            name="recipientName"
                                            required
                                            defaultValue={
                                                editing !== 'new'
                                                    ? editing?.recipientName
                                                    : ''
                                            }
                                            placeholder={t(
                                                'settings.addresses.recipientNamePlaceholder',
                                            )}
                                            error={errors.recipientName}
                                        />
                                    </AuthField>

                                    <AuthField
                                        id="phone"
                                        label={t('settings.addresses.phone')}
                                        error={errors.phone}
                                    >
                                        <AuthInput
                                            id="phone"
                                            name="phone"
                                            required
                                            defaultValue={
                                                editing !== 'new'
                                                    ? editing?.phone
                                                    : ''
                                            }
                                            placeholder={t(
                                                'settings.addresses.phonePlaceholder',
                                            )}
                                            error={errors.phone}
                                        />
                                    </AuthField>

                                    <AuthField
                                        id="addressLine"
                                        label={t(
                                            'settings.addresses.addressLine',
                                        )}
                                        error={errors.addressLine}
                                    >
                                        <AuthInput
                                            id="addressLine"
                                            name="addressLine"
                                            required
                                            defaultValue={
                                                editing !== 'new'
                                                    ? editing?.addressLine
                                                    : ''
                                            }
                                            placeholder={t(
                                                'settings.addresses.addressLinePlaceholder',
                                            )}
                                            error={errors.addressLine}
                                        />
                                    </AuthField>

                                    <AuthCheckbox
                                        id="isDefault"
                                        name="isDefault"
                                        value="1"
                                        label={t(
                                            'settings.addresses.setAsDefault',
                                        )}
                                        defaultChecked={
                                            editing !== 'new'
                                                ? editing?.isDefault
                                                : addresses.length === 0
                                        }
                                        disabled={
                                            editing !== 'new' &&
                                            editing?.isDefault
                                        }
                                    />

                                    <DialogFooter className="gap-3 sm:gap-3">
                                        <StorefrontButton
                                            type="button"
                                            variant="secondary"
                                            onClick={() => setEditing(null)}
                                        >
                                            {t('settings.addresses.cancel')}
                                        </StorefrontButton>
                                        <StorefrontButton
                                            type="submit"
                                            variant="primary"
                                            disabled={processing}
                                        >
                                            {t('settings.addresses.save')}
                                        </StorefrontButton>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
            >
                <DialogContent className="rounded-none border-hairline bg-canvas sm:max-w-md">
                    <DialogTitle className="text-heading-md text-ink">
                        {t('settings.addresses.deleteConfirmTitle')}
                    </DialogTitle>
                    <DialogDescription className="text-caption-md text-mute">
                        {t('settings.addresses.deleteConfirmDescription')}
                    </DialogDescription>

                    {deleting && (
                        <Form
                            {...ShippingAddressController.destroy.form(
                                deleting.id,
                            )}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setDeleting(null)}
                        >
                            {({ processing }) => (
                                <DialogFooter className="gap-3 sm:gap-3">
                                    <StorefrontButton
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setDeleting(null)}
                                    >
                                        {t('settings.addresses.cancel')}
                                    </StorefrontButton>
                                    <StorefrontButton
                                        type="submit"
                                        variant="secondary"
                                        className="text-sale"
                                        disabled={processing}
                                    >
                                        {t('settings.addresses.delete')}
                                    </StorefrontButton>
                                </DialogFooter>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
