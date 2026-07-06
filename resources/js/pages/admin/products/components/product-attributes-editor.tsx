import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
    AdminTextareaField,
} from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';
import type { AdminProduct } from '@/types/admin-product';

const GROUPS = [
    { value: 'tech_specs', label: 'Tech Specs' },
    { value: 'details_care', label: 'Details & Care' },
    { value: 'shipping_returns', label: 'Shipping & Returns' },
];

type ProductAttributesEditorProps = {
    product: AdminProduct;
};

export function ProductAttributesEditor({
    product,
}: ProductAttributesEditorProps) {
    const { t } = useTranslation('admin');

    const form = useForm({
        attributes: product.attributes.map((attr) => ({
            group: attr.group,
            key: attr.key,
            label: attr.label,
            value: attr.value,
            sortOrder: attr.sortOrder,
            optionValueId: attr.optionValueId,
        })),
    });

    const addRow = () => {
        form.setData('attributes', [
            ...form.data.attributes,
            {
                group: 'tech_specs',
                key: '',
                label: '',
                value: '',
                sortOrder: form.data.attributes.length,
                optionValueId: null,
            },
        ]);
    };

    const save = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(`/admin/products/${product.slug}/attributes`);
    };

    return (
        <form onSubmit={save}>
            <AdminFormSection title={t('products.tabAttributes')}>
                <div className="space-y-4">
                    {form.data.attributes.map((attr, index) => (
                        <div
                            key={`attr-${index}`}
                            className="border-admin rounded-admin-lg grid gap-3 border p-4 tablet:grid-cols-2"
                        >
                            <AdminSelectField
                                label={t('products.attributeGroup')}
                                value={attr.group}
                                onChange={(value) => {
                                    const attributes = [
                                        ...form.data.attributes,
                                    ];
                                    attributes[index].group = value;
                                    form.setData('attributes', attributes);
                                }}
                                options={GROUPS}
                            />
                            <AdminInputField
                                label={t('products.attributeKey')}
                                value={attr.key}
                                onChange={(e) => {
                                    const attributes = [
                                        ...form.data.attributes,
                                    ];
                                    attributes[index].key = e.target.value;
                                    form.setData('attributes', attributes);
                                }}
                            />
                            <AdminInputField
                                label={t('products.attributeLabel')}
                                value={attr.label}
                                onChange={(e) => {
                                    const attributes = [
                                        ...form.data.attributes,
                                    ];
                                    attributes[index].label = e.target.value;
                                    form.setData('attributes', attributes);
                                }}
                            />
                            <AdminTextareaField
                                label={t('products.attributeValue')}
                                rows={2}
                                value={attr.value}
                                onChange={(e) => {
                                    const attributes = [
                                        ...form.data.attributes,
                                    ];
                                    attributes[index].value = e.target.value;
                                    form.setData('attributes', attributes);
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={addRow}
                    >
                        {t('products.addAttribute')}
                    </AdminButton>
                    <AdminButton type="submit" disabled={form.processing}>
                        {t('products.saveAttributes')}
                    </AdminButton>
                </div>
            </AdminFormSection>
        </form>
    );
}
