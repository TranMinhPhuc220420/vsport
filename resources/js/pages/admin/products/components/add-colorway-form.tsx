import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminInputField } from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { SizeChipPicker } from '@/components/admin/size-chip-picker';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type AddColorwayFormProps = {
    productSlug: string;
};

export function AddColorwayForm({ productSlug }: AddColorwayFormProps) {
    const { t } = useTranslation('admin');
    const [sizes, setSizes] = useState<string[]>([
        'US 8',
        'US 9',
        'US 10',
        'US 11',
        'US 12',
    ]);

    const form = useForm({
        colorway_code: '',
        color_name: '',
        discount_price: '',
        is_active: true,
    });

    const addColorway = (event: React.FormEvent) => {
        event.preventDefault();

        form.transform((formData) => ({
            ...formData,
            discount_price: formData.discount_price || null,
            sizes,
        }));

        form.post(`/admin/products/${productSlug}/colorways`);
    };

    return (
        <form onSubmit={addColorway}>
            <AdminFormSection
                title={t('products.addColorway')}
                className="border-dashed"
            >
                <div className="grid gap-4 tablet:grid-cols-2">
                    <AdminInputField
                        label={t('products.colorwayCode')}
                        value={form.data.colorway_code}
                        onChange={(e) =>
                            form.setData('colorway_code', e.target.value)
                        }
                        error={form.errors.colorway_code}
                    />
                    <AdminInputField
                        label={t('products.colorName')}
                        value={form.data.color_name}
                        onChange={(e) =>
                            form.setData('color_name', e.target.value)
                        }
                        error={form.errors.color_name}
                    />
                </div>

                <AdminInputField
                    label={t('products.discountPriceField')}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.data.discount_price}
                    onChange={(e) =>
                        form.setData('discount_price', e.target.value)
                    }
                    error={form.errors.discount_price}
                />

                <SizeChipPicker value={sizes} onChange={setSizes} />

                <div className="flex items-center gap-2">
                    <Checkbox
                        id="new-colorway-active"
                        checked={form.data.is_active}
                        onCheckedChange={(checked) =>
                            form.setData('is_active', checked === true)
                        }
                    />
                    <Label
                        htmlFor="new-colorway-active"
                        className="admin-label font-normal"
                    >
                        {t('products.active')}
                    </Label>
                </div>

                <AdminButton
                    type="submit"
                    variant="secondary"
                    disabled={form.processing || sizes.length === 0}
                >
                    {t('products.addColorway')}
                </AdminButton>
            </AdminFormSection>
        </form>
    );
}
