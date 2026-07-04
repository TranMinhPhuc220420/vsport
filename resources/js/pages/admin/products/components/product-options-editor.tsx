import { router, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
} from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';
import type { AdminProduct, AdminProductOption } from '@/types/admin-product';

type ProductOptionsEditorProps = {
    product: AdminProduct;
};

const DISPLAY_TYPES = [
    { value: 'swatch', label: 'Swatch' },
    { value: 'button', label: 'Button' },
    { value: 'dropdown', label: 'Dropdown' },
];

export function ProductOptionsEditor({ product }: ProductOptionsEditorProps) {
    const { t } = useTranslation('admin');

    const form = useForm({
        options: product.options.map((option) => ({
            id: option.id,
            name: option.name,
            position: option.position,
            displayType: option.displayType,
            isRequired: option.isRequired,
            drivesGallery: option.drivesGallery,
            metadata: option.metadata,
            values: option.values.map((value) => ({
                id: value.id,
                value: value.value,
                slug: value.slug,
                swatchHex: value.swatchHex,
                sortOrder: value.sortOrder,
                salePrice: value.salePrice,
                metadata: value.metadata,
            })),
        })),
    });

    const addOption = () => {
        form.setData('options', [
            ...form.data.options,
            {
                name: 'New option',
                position: form.data.options.length,
                displayType: 'button',
                isRequired: true,
                drivesGallery: false,
                metadata: null,
                values: [{ value: 'Default', slug: 'default', sortOrder: 0 }],
            },
        ]);
    };

    const addValue = (optionIndex: number) => {
        const options = [...form.data.options];
        const option = options[optionIndex];
        option.values = [
            ...option.values,
            {
                value: '',
                slug: '',
                sortOrder: option.values.length,
            },
        ];
        form.setData('options', options);
    };

    const save = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(`/admin/products/${product.slug}/options`);
    };

    const generateVariants = () => {
        router.post(`/admin/products/${product.slug}/variants/generate`);
    };

    return (
        <form onSubmit={save} className="space-y-6">
            <AdminFormSection title={t('products.tabOptions')}>
                {form.data.options.map((option, optionIndex) => (
                    <div
                        key={option.id ?? `new-${optionIndex}`}
                        className="border-admin space-y-4 rounded-admin-lg border bg-[var(--admin-surface)] p-4"
                    >
                        <div className="grid gap-4 tablet:grid-cols-2">
                            <AdminInputField
                                label={t('products.optionName')}
                                value={option.name}
                                onChange={(e) => {
                                    const options = [...form.data.options];
                                    options[optionIndex].name = e.target.value;
                                    form.setData('options', options);
                                }}
                            />
                            <AdminSelectField
                                label={t('products.displayType')}
                                value={option.displayType}
                                onChange={(value) => {
                                    const options = [...form.data.options];
                                    options[optionIndex].displayType = value as AdminProductOption['displayType'];
                                    form.setData('options', options);
                                }}
                                options={DISPLAY_TYPES}
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={option.drivesGallery}
                                onChange={(e) => {
                                    const options = [...form.data.options];
                                    options[optionIndex].drivesGallery =
                                        e.target.checked;
                                    form.setData('options', options);
                                }}
                            />
                            {t('products.drivesGallery')}
                        </label>

                        <div className="space-y-2">
                            <p className="text-admin-secondary text-sm font-medium">
                                {t('products.optionValues')}
                            </p>
                            {option.values.map((value, valueIndex) => (
                                <div
                                    key={value.id ?? `value-${valueIndex}`}
                                    className="grid gap-2 tablet:grid-cols-3"
                                >
                                    <AdminInputField
                                        label={t('products.value')}
                                        value={value.value}
                                        onChange={(e) => {
                                            const options = [
                                                ...form.data.options,
                                            ];
                                            options[optionIndex].values[
                                                valueIndex
                                            ].value = e.target.value;
                                            form.setData('options', options);
                                        }}
                                    />
                                    {option.displayType === 'swatch' ? (
                                        <AdminInputField
                                            label={t('products.swatchHex')}
                                            value={value.swatchHex ?? ''}
                                            onChange={(e) => {
                                                const options = [
                                                    ...form.data.options,
                                                ];
                                                options[optionIndex].values[
                                                    valueIndex
                                                ].swatchHex = e.target.value;
                                                form.setData('options', options);
                                            }}
                                        />
                                    ) : null}
                                    <AdminInputField
                                        label={t('products.salePrice')}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={value.salePrice?.toString() ?? ''}
                                        onChange={(e) => {
                                            const options = [
                                                ...form.data.options,
                                            ];
                                            options[optionIndex].values[
                                                valueIndex
                                            ].salePrice = e.target.value
                                                ? Number(e.target.value)
                                                : null;
                                            form.setData('options', options);
                                        }}
                                    />
                                </div>
                            ))}
                            <AdminButton
                                type="button"
                                variant="secondary"
                                onClick={() => addValue(optionIndex)}
                            >
                                {t('products.addValue')}
                            </AdminButton>
                        </div>
                    </div>
                ))}

                <div className="flex flex-wrap gap-3">
                    <AdminButton type="button" variant="secondary" onClick={addOption}>
                        {t('products.addOption')}
                    </AdminButton>
                    <AdminButton type="submit" disabled={form.processing}>
                        {t('products.saveOptions')}
                    </AdminButton>
                    <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={generateVariants}
                    >
                        {t('products.generateVariants')}
                    </AdminButton>
                </div>
            </AdminFormSection>
        </form>
    );
}
