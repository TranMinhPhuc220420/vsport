import { Head, setLayoutProps, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
} from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { AdminButton } from '@/components/admin/ui/admin-button';

type AdminProductsCreateProps = {
    categories: { id: number; name: string }[];
    brands: { id: number; name: string }[];
    genders: string[];
};

export default function AdminProductsCreate({
    categories,
    brands,
    genders,
}: AdminProductsCreateProps) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.products'), href: '/admin/products' },
            { title: t('breadcrumb.create'), href: '/admin/products/create' },
        ],
    });

    const { data, setData, processing, errors, post, transform } = useForm({
        style_code: '',
        name: '',
        slug: '',
        description: '',
        description_html: '',
        category_id: categories[0]?.id ?? '',
        brand_id: '' as number | '',
        sub_title: '',
        base_price: '',
        gender: genders[0] ?? 'Men',
        is_customizable: false,
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        transform((formData) => ({
            ...formData,
            brand_id: formData.brand_id === '' ? null : formData.brand_id,
        }));

        post('/admin/products');
    };

    return (
        <>
            <Head title={t('products.newTitle')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/products"
                    backLabel={t('products.back')}
                    title={t('products.newTitle')}
                />

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    <AdminFormSection title={t('products.wizardStep1Title')}>
                        <p className="text-admin-secondary text-sm">
                            {t('products.createOptionsHint')}
                        </p>

                        <div className="grid gap-4 tablet:grid-cols-2">
                            <AdminInputField
                                label={t('products.styleCode')}
                                value={data.style_code}
                                onChange={(e) =>
                                    setData('style_code', e.target.value)
                                }
                                error={errors.style_code}
                            />
                            <AdminInputField
                                label={t('products.slug')}
                                value={data.slug}
                                onChange={(e) =>
                                    setData('slug', e.target.value)
                                }
                                error={errors.slug}
                            />
                        </div>

                        <AdminInputField
                            label={t('products.name')}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                        />

                        <AdminInputField
                            label={t('products.subtitle')}
                            value={data.sub_title}
                            onChange={(e) =>
                                setData('sub_title', e.target.value)
                            }
                        />

                        <RichTextEditor
                            id="product-description-html"
                            label={t('products.descriptionLabel')}
                            value={data.description_html}
                            placeholder={t('products.descriptionPlaceholder', {
                                defaultValue: 'Describe this product…',
                            })}
                            error={
                                errors.description_html || errors.description
                            }
                            onChange={(html) =>
                                setData('description_html', html ?? '')
                            }
                            onTextChange={(text) =>
                                setData('description', text)
                            }
                        />

                        <div className="grid gap-4 tablet:grid-cols-3">
                            <AdminSelectField
                                label={t('products.category')}
                                value={data.category_id}
                                onChange={(value) =>
                                    setData('category_id', Number(value))
                                }
                                options={categories.map((category) => ({
                                    value: category.id,
                                    label: category.name,
                                }))}
                                error={errors.category_id}
                            />
                            <AdminSelectField
                                label={t('products.brand')}
                                value={data.brand_id}
                                onChange={(value) =>
                                    setData(
                                        'brand_id',
                                        value === '' ? '' : Number(value),
                                    )
                                }
                                options={[
                                    {
                                        value: '',
                                        label: t('products.noneBrand'),
                                    },
                                    ...brands.map((brand) => ({
                                        value: brand.id,
                                        label: brand.name,
                                    })),
                                ]}
                                error={errors.brand_id}
                            />
                            <AdminSelectField
                                label={t('products.gender')}
                                value={data.gender}
                                onChange={(value) => setData('gender', value)}
                                options={genders.map((gender) => ({
                                    value: gender,
                                    label: gender,
                                }))}
                            />
                            <AdminInputField
                                label={t('products.basePrice')}
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.base_price}
                                onChange={(e) =>
                                    setData('base_price', e.target.value)
                                }
                                error={errors.base_price}
                            />
                        </div>

                        <AdminButton type="submit" disabled={processing}>
                            {t('products.create')}
                        </AdminButton>
                    </AdminFormSection>
                </form>
            </div>
        </>
    );
}
