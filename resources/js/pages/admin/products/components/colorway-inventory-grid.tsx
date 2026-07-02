import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    AdminConfirmDialog,
} from '@/components/admin/admin-form';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { SizeChipPicker } from '@/components/admin/size-chip-picker';
import { Input } from '@/components/ui/input';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { cn } from '@/lib/utils';
import type { ProductColorway } from '@/types/admin-product';

type ColorwayInventoryGridProps = {
    colorways: ProductColorway[];
};

export function ColorwayInventoryGrid({
    colorways,
}: ColorwayInventoryGridProps) {
    const { t } = useTranslation('admin');
    const [activeColorwayId, setActiveColorwayId] = useState(
        colorways[0]?.id ?? 0,
    );

    const activeColorway = useMemo(
        () => colorways.find((c) => c.id === activeColorwayId) ?? colorways[0],
        [activeColorwayId, colorways],
    );

    if (!activeColorway) {
        return (
            <p className="text-sm text-admin-secondary">
                {t('products.noColorwaysForInventory')}
            </p>
        );
    }

    return (
        <ColorwayInventoryPanel
            key={activeColorway.id}
            colorway={activeColorway}
            colorways={colorways}
            activeColorwayId={activeColorwayId}
            onSelectColorway={setActiveColorwayId}
        />
    );
}

function ColorwayInventoryPanel({
    colorway,
    colorways,
    activeColorwayId,
    onSelectColorway,
}: {
    colorway: ProductColorway;
    colorways: ProductColorway[];
    activeColorwayId: number;
    onSelectColorway: (id: number) => void;
}) {
    const { t } = useTranslation('admin');
    const [sizes, setSizes] = useState<string[]>(
        colorway.variants.map((v) => v.size),
    );
    const [quantities, setQuantities] = useState<Record<number, number>>(
        Object.fromEntries(
            colorway.variants.map((v) => [v.id, v.quantity]),
        ),
    );
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [confirmSync, setConfirmSync] = useState(false);

    const originalQuantities = useMemo(
        () =>
            Object.fromEntries(
                colorway.variants.map((v) => [v.id, v.quantity]),
            ),
        [colorway.variants],
    );

    const removedSizes = colorway.variants
        .map((v) => v.size)
        .filter((size) => !sizes.includes(size));

    const saveInventory = () => {
        setSaving(true);
        router.patch(
            `/admin/colorways/${colorway.id}/inventory`,
            {
                variants: colorway.variants.map((variant) => ({
                    id: variant.id,
                    quantity: quantities[variant.id] ?? variant.quantity,
                })),
            },
            {
                preserveScroll: true,
                onFinish: () => setSaving(false),
            },
        );
    };

    const syncSizes = () => {
        setSyncing(true);
        const variants = sizes.map((size) => {
            const existing = colorway.variants.find((v) => v.size === size);

            return {
                size,
                quantity: existing
                    ? (quantities[existing.id] ?? existing.quantity)
                    : 0,
            };
        });

        router.post(
            `/admin/colorways/${colorway.id}/variants`,
            { variants },
            {
                preserveScroll: true,
                onFinish: () => {
                    setSyncing(false);
                    setConfirmSync(false);
                },
            },
        );
    };

    const handleSyncClick = () => {
        if (removedSizes.length > 0) {
            setConfirmSync(true);
            return;
        }

        syncSizes();
    };

    return (
        <AdminFormSection
            title={t('products.sizesInventory')}
            description={t('products.inventoryTabHint')}
        >
            {colorways.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    {colorways.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelectColorway(item.id)}
                            className={cn(
                                'rounded-md border px-3 py-1.5 text-sm',
                                item.id === activeColorwayId
                                    ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-white'
                                    : 'border-admin bg-[var(--admin-surface)] text-[var(--admin-primary)] hover:bg-[var(--admin-neutral)]',
                            )}
                        >
                            {item.colorName}
                        </button>
                    ))}
                </div>
            )}

            <SizeChipPicker value={sizes} onChange={setSizes} />

            <div className="overflow-hidden rounded-lg border border-admin bg-[var(--admin-surface)] shadow-sm">
                <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                    <thead>
                        <tr className="border-b border-admin bg-[var(--admin-neutral)] text-xs font-medium text-admin-secondary">
                            <th className="sticky left-0 bg-[var(--admin-neutral)] px-4 py-2.5">
                                {t('products.size')}
                            </th>
                            <th className="px-4 py-2.5">{t('products.sku')}</th>
                            <th className="px-4 py-2.5">
                                {t('products.quantity')}
                            </th>
                            <th className="px-4 py-2.5">
                                {t('products.available')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {colorway.variants
                            .filter((variant) => sizes.includes(variant.size))
                            .map((variant) => {
                                const changed =
                                    quantities[variant.id] !==
                                    originalQuantities[variant.id];

                                return (
                                    <tr
                                        key={variant.id}
                                        className="border-b border-admin"
                                    >
                                        <td className="sticky left-0 bg-[var(--admin-surface)] px-4 py-2.5">
                                            {variant.size}
                                        </td>
                                        <td className="px-4 py-2.5 text-sm text-admin-secondary">
                                            {variant.sku}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <Input
                                                type="number"
                                                min="0"
                                                value={
                                                    quantities[variant.id] ??
                                                    variant.quantity
                                                }
                                                onChange={(e) =>
                                                    setQuantities(
                                                        (current) => ({
                                                            ...current,
                                                            [variant.id]:
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                        }),
                                                    )
                                                }
                                                className={cn(
                                                    'h-9 rounded-md border-admin bg-[var(--admin-surface)] shadow-none',
                                                    changed &&
                                                        'border-amber-400 focus-visible:border-amber-500',
                                                )}
                                            />
                                        </td>
                                        <td className="px-4 py-2.5 text-sm">
                                            {variant.available}
                                        </td>
                                    </tr>
                                );
                            })}
                        {sizes
                            .filter(
                                (size) =>
                                    !colorway.variants.some(
                                        (v) => v.size === size,
                                    ),
                            )
                            .map((size) => (
                                <tr
                                    key={`new-${size}`}
                                    className="border-b border-admin bg-[var(--admin-neutral)]/50"
                                >
                                    <td className="sticky left-0 bg-[var(--admin-neutral)]/50 px-4 py-2.5">
                                        {size}
                                    </td>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-2.5 text-sm text-admin-secondary"
                                    >
                                        {t('products.syncToCreateSku')}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <AdminButton
                    type="button"
                    onClick={saveInventory}
                    disabled={saving || colorway.variants.length === 0}
                >
                    {t('products.saveInventory')}
                </AdminButton>
                <AdminButton
                    type="button"
                    variant="secondary"
                    onClick={handleSyncClick}
                    disabled={syncing || sizes.length === 0}
                >
                    {t('products.syncSizes')}
                </AdminButton>
            </div>
            <p className="text-xs text-admin-secondary">
                {t('products.syncSizesHint')}
            </p>

            <AdminConfirmDialog
                open={confirmSync}
                onOpenChange={setConfirmSync}
                title={t('products.syncSizesConfirmTitle')}
                description={t('products.syncSizesConfirmDescription', {
                    sizes: removedSizes.join(', '),
                })}
                onConfirm={syncSizes}
                loading={syncing}
            />
        </AdminFormSection>
    );
}
