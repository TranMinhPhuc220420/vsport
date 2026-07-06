import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { Input } from '@/components/ui/input';
import type { AdminProduct } from '@/types/admin-product';

type VariantInventoryGridProps = {
    product: AdminProduct;
};

export function VariantInventoryGrid({ product }: VariantInventoryGridProps) {
    const { t } = useTranslation('admin');

    const form = useForm({
        variants: product.variants.map((variant) => ({
            id: variant.id,
            quantity: variant.quantity,
        })),
    });

    const save = (event: React.FormEvent) => {
        event.preventDefault();
        form.patch(`/admin/products/${product.slug}/variants/inventory`);
    };

    if (product.variants.length === 0) {
        return (
            <p className="text-admin-secondary text-sm">
                {t('products.noVariants')}
            </p>
        );
    }

    return (
        <form onSubmit={save}>
            <AdminFormSection title={t('products.tabInventory')}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-admin border-b text-left">
                                <th className="py-2 pr-4">SKU</th>
                                <th className="py-2 pr-4">
                                    {t('products.variant')}
                                </th>
                                <th className="py-2">
                                    {t('products.quantity')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {product.variants.map((variant, index) => (
                                <tr
                                    key={variant.id}
                                    className="border-admin border-b"
                                >
                                    <td className="py-3 pr-4 font-mono text-xs">
                                        {variant.sku}
                                    </td>
                                    <td className="py-3 pr-4">
                                        {variant.optionLabels.join(' / ')}
                                    </td>
                                    <td className="py-3">
                                        <Input
                                            type="number"
                                            min={0}
                                            className="w-24"
                                            value={
                                                form.data.variants[index]
                                                    .quantity
                                            }
                                            onChange={(e) => {
                                                const variants = [
                                                    ...form.data.variants,
                                                ];
                                                variants[index].quantity =
                                                    Number(e.target.value);
                                                form.setData(
                                                    'variants',
                                                    variants,
                                                );
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <AdminButton
                    type="submit"
                    disabled={form.processing}
                    className="mt-4"
                >
                    {t('products.saveInventory')}
                </AdminButton>
            </AdminFormSection>
        </form>
    );
}
