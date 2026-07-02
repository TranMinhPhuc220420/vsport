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

type ProductDetailsFormProps = {
    product: AdminProduct;
    categories: { id: number; name: string }[];
    genders: string[];
};

export function ProductDetailsForm({
    product,
    categories,
    genders,
}: ProductDetailsFormProps) {
    const { t } = useTranslation('admin');

    const form = useForm({
        style_code: product.styleCode,
        name: product.name,
        slug: product.slug,
        description: product.description ?? '',
        category_id: product.categoryId,
        sub_title: product.subTitle ?? '',
        base_price: product.basePrice.toString(),
        gender: product.gender,
    });

    const saveProduct = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(`/admin/products/${product.slug}`);
    };

    return (
        <form onSubmit={saveProduct}>
            <AdminFormSection title={t('products.productDetails')}>
                <div className="grid gap-4 tablet:grid-cols-2">
                    <AdminInputField
                        label={t('products.styleCode')}
                        value={form.data.style_code}
                        onChange={(e) =>
                            form.setData('style_code', e.target.value)
                        }
                        error={form.errors.style_code}
                    />
                    <AdminInputField
                        label={t('products.slug')}
                        value={form.data.slug}
                        onChange={(e) => form.setData('slug', e.target.value)}
                        error={form.errors.slug}
                    />
                </div>

                <AdminInputField
                    label={t('products.name')}
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    error={form.errors.name}
                />

                <AdminInputField
                    label={t('products.subtitle')}
                    value={form.data.sub_title}
                    onChange={(e) =>
                        form.setData('sub_title', e.target.value)
                    }
                    error={form.errors.sub_title}
                />

                <AdminTextareaField
                    label={t('products.descriptionLabel')}
                    rows={4}
                    value={form.data.description}
                    onChange={(e) =>
                        form.setData('description', e.target.value)
                    }
                    error={form.errors.description}
                />

                <div className="grid gap-4 tablet:grid-cols-3">
                    <AdminSelectField
                        label={t('products.category')}
                        value={form.data.category_id}
                        onChange={(value) =>
                            form.setData('category_id', Number(value))
                        }
                        options={categories.map((category) => ({
                            value: category.id,
                            label: category.name,
                        }))}
                        error={form.errors.category_id}
                    />
                    <AdminSelectField
                        label={t('products.gender')}
                        value={form.data.gender}
                        onChange={(value) => form.setData('gender', value)}
                        options={genders.map((gender) => ({
                            value: gender,
                            label: gender,
                        }))}
                        error={form.errors.gender}
                    />
                    <AdminInputField
                        label={t('products.basePrice')}
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.data.base_price}
                        onChange={(e) =>
                            form.setData('base_price', e.target.value)
                        }
                        error={form.errors.base_price}
                    />
                </div>

                <div className="pt-2">
                    <AdminButton type="submit" disabled={form.processing}>
                        {t('products.save')}
                    </AdminButton>
                </div>
            </AdminFormSection>
        </form>
    );
}
