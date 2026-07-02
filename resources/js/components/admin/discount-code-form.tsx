import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
} from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type DiscountType = 'percent' | 'fixed';

type DiscountCodeFormProps = {
    mode: 'create' | 'edit';
    action: string;
    method: 'post' | 'put';
    initial: {
        code: string;
        type: DiscountType;
        value: string | number;
        minOrderAmount: string | number;
        maxUses: string | number | '';
        startsAt: string;
        expiresAt: string;
        isActive: boolean;
    };
};

export function DiscountCodeForm({
    mode,
    action,
    method,
    initial,
}: DiscountCodeFormProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { data, setData, processing, errors, post, put } = useForm(initial);

    const title =
        mode === 'create'
            ? t('discountCodes.newTitle')
            : t('discountCodes.editTitle');
    const submitLabel =
        mode === 'create' ? t('discountCodes.create') : t('discountCodes.save');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (method === 'put') {
            put(action);

            return;
        }

        post(action);
    };

    return (
        <>
            <Head title={title} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/discount-codes"
                    backLabel={t('discountCodes.back')}
                    title={title}
                />

                <form onSubmit={handleSubmit} className="max-w-xl">
                    <AdminFormSection title={title}>
                        <AdminInputField
                            label={t('discountCodes.code')}
                            value={data.code}
                            onChange={(e) =>
                                setData('code', e.target.value.toUpperCase())
                            }
                            error={errors.code}
                        />

                        <div className="grid gap-4 tablet:grid-cols-2">
                            <AdminSelectField
                                label={t('discountCodes.type')}
                                value={data.type}
                                onChange={(value) =>
                                    setData('type', value as DiscountType)
                                }
                                options={[
                                    {
                                        value: 'percent',
                                        label: t('discountCodes.percent'),
                                    },
                                    {
                                        value: 'fixed',
                                        label: t('discountCodes.fixed'),
                                    },
                                ]}
                                error={errors.type}
                            />
                            <AdminInputField
                                label={t('discountCodes.value')}
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={data.value}
                                onChange={(e) =>
                                    setData('value', e.target.value)
                                }
                                error={errors.value}
                            />
                        </div>

                        <div className="grid gap-4 tablet:grid-cols-2">
                            <AdminInputField
                                label={t('discountCodes.minOrderAmount')}
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.minOrderAmount}
                                onChange={(e) =>
                                    setData('minOrderAmount', e.target.value)
                                }
                                error={errors.minOrderAmount}
                            />
                            <AdminInputField
                                label={t('discountCodes.maxUses')}
                                type="number"
                                min="1"
                                step="1"
                                value={data.maxUses}
                                onChange={(e) =>
                                    setData('maxUses', e.target.value)
                                }
                                placeholder={t('discountCodes.unlimited')}
                                error={errors.maxUses}
                            />
                        </div>

                        <div className="grid gap-4 tablet:grid-cols-2">
                            <AdminInputField
                                label={t('discountCodes.startsAt')}
                                type="datetime-local"
                                value={data.startsAt}
                                onChange={(e) =>
                                    setData('startsAt', e.target.value)
                                }
                                error={errors.startsAt}
                            />
                            <AdminInputField
                                label={t('discountCodes.expiresAt')}
                                type="datetime-local"
                                value={data.expiresAt}
                                onChange={(e) =>
                                    setData('expiresAt', e.target.value)
                                }
                                error={errors.expiresAt}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="isActive"
                                checked={data.isActive}
                                onCheckedChange={(checked) =>
                                    setData('isActive', checked === true)
                                }
                            />
                            <Label htmlFor="isActive" className="admin-label">
                                {tCommon('active')}
                            </Label>
                        </div>
                        {errors.isActive && (
                            <p className="admin-caption text-red-600">
                                {errors.isActive}
                            </p>
                        )}

                        <AdminButton type="submit" disabled={processing}>
                            {submitLabel}
                        </AdminButton>
                    </AdminFormSection>
                </form>
            </div>
        </>
    );
}
