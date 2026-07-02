import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ColorwayImageManager } from '@/components/admin/colorway-image-manager';
import { AdminInputField } from '@/components/admin/admin-field';
import {
    AdminActiveBadge,
    AdminConfirmDialog,
} from '@/components/admin/admin-form';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { AdminCard } from '@/components/admin/ui/admin-card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
    getPrimaryImageUrl,
    type ProductColorway,
} from '@/types/admin-product';

type ColorwayCardProps = {
    colorway: ProductColorway;
    productName: string;
    defaultOpen?: boolean;
};

export function ColorwayCard({
    colorway,
    productName,
    defaultOpen = false,
}: ColorwayCardProps) {
    const { t } = useTranslation('admin');
    const [open, setOpen] = useState(defaultOpen);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const form = useForm({
        color_name: colorway.colorName,
        discount_price: colorway.discountPrice?.toString() ?? '',
        is_active: colorway.isActive,
    });

    const thumbnailUrl = getPrimaryImageUrl(colorway);

    const updateColorway = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(`/admin/colorways/${colorway.id}`);
    };

    const destroyColorway = () => {
        router.delete(`/admin/colorways/${colorway.id}`, {
            onFinish: () => setConfirmDelete(false),
        });
    };

    return (
        <>
            <AdminCard className="overflow-hidden p-0">
                <button
                    type="button"
                    onClick={() => setOpen((current) => !current)}
                    className="flex w-full items-center gap-4 p-4 text-left"
                >
                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-admin bg-[var(--admin-neutral)]">
                        {thumbnailUrl ? (
                            <img
                                src={thumbnailUrl}
                                alt=""
                                className="size-full object-cover"
                            />
                        ) : (
                            <span className="text-xs text-admin-secondary">—</span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-[var(--admin-primary)]">
                            {colorway.fullStyleCode}
                        </p>
                        <p className="text-sm text-admin-secondary">
                            {colorway.colorName}
                        </p>
                    </div>
                    <AdminActiveBadge active={colorway.isActive} />
                </button>

                <div
                    className={cn(
                        'border-t border-admin px-4 pb-4',
                        !open && 'hidden',
                    )}
                >
                    <form onSubmit={updateColorway} className="space-y-4 pt-4">
                        <div className="grid gap-4 tablet:grid-cols-3">
                            <AdminInputField
                                label={t('products.colorName')}
                                value={form.data.color_name}
                                onChange={(e) =>
                                    form.setData('color_name', e.target.value)
                                }
                                error={form.errors.color_name}
                            />
                            <AdminInputField
                                label={t('products.discountPriceField')}
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.data.discount_price}
                                onChange={(e) =>
                                    form.setData(
                                        'discount_price',
                                        e.target.value,
                                    )
                                }
                                error={form.errors.discount_price}
                            />
                            <div className="flex items-end gap-3">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id={`active-${colorway.id}`}
                                        checked={form.data.is_active}
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'is_active',
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor={`active-${colorway.id}`}
                                        className="admin-label font-normal"
                                    >
                                        {t('products.active')}
                                    </Label>
                                </div>
                                <AdminButton
                                    type="submit"
                                    variant="secondary"
                                    disabled={form.processing}
                                >
                                    {t('products.saveColorway')}
                                </AdminButton>
                            </div>
                        </div>
                    </form>

                    <div className="mt-4">
                        <ColorwayImageManager
                            colorwayId={colorway.id}
                            productName={productName}
                            colorName={colorway.colorName}
                            initialImages={colorway.images}
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setConfirmDelete(true)}
                            className="text-sm text-red-600 hover:underline"
                        >
                            {t('products.deleteColorway')}
                        </button>
                    </div>
                </div>
            </AdminCard>

            <AdminConfirmDialog
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
                title={t('products.deleteColorwayConfirm')}
                variant="destructive"
                onConfirm={destroyColorway}
            />
        </>
    );
}
