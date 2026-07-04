import { Head, setLayoutProps, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
    AdminTextareaField,
} from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { SizeChipPicker } from '@/components/admin/size-chip-picker';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { AdminCard } from '@/components/admin/ui/admin-card';

type AdminProductsCreateProps = {
    categories: { id: number; name: string }[];
    genders: string[];
};

export default function AdminProductsCreate({
    categories,
    genders,
}: AdminProductsCreateProps) {
    const { t } = useTranslation('admin');
    const [step, setStep] = useState(1);
    const [sizes, setSizes] = useState<string[]>([
        'US 8',
        'US 9',
        'US 10',
        'US 11',
        'US 12',
    ]);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.products'), href: '/admin/products' },
            { title: t('breadcrumb.create'), href: '/admin/products/create' },
        ],
    });

    const { data, setData, processing, errors, transform, post } = useForm({
        style_code: '',
        name: '',
        slug: '',
        description: '',
        category_id: categories[0]?.id ?? '',
        sub_title: '',
        base_price: '',
        gender: genders[0] ?? 'Men',
        colorway_code: '',
        color_name: '',
        discount_price: '',
    });

    const skuPreview = useMemo(() => {
        if (!data.style_code || !data.colorway_code || sizes.length === 0) {
            return [];
        }

        return sizes.map((size) =>
            `${data.style_code}-${data.colorway_code}-${size}`.replace(
                /\s+/g,
                '',
            ),
        );
    }, [data.colorway_code, data.style_code, sizes]);

    const stepOneValid =
        data.style_code.trim() !== '' &&
        data.name.trim() !== '' &&
        data.slug.trim() !== '' &&
        data.base_price !== '' &&
        Boolean(data.category_id);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        transform((formData) => ({
            style_code: formData.style_code,
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            category_id: formData.category_id,
            sub_title: formData.sub_title,
            base_price: formData.base_price,
            gender: formData.gender,
            colorway_code: formData.colorway_code,
            color_name: formData.color_name,
            discount_price: formData.discount_price || null,
            sizes,
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

                <div className="flex gap-4 text-sm">
                    <div
                        className={
                            step === 1
                                ? 'font-medium text-[var(--admin-primary)]'
                                : 'text-admin-secondary'
                        }
                    >
                        1. {t('products.wizardStep1Title')}
                    </div>
                    <div
                        className={
                            step === 2
                                ? 'font-medium text-[var(--admin-primary)]'
                                : 'text-admin-secondary'
                        }
                    >
                        2. {t('products.wizardStep2Title')}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                    {step === 1 ? (
                        <AdminFormSection
                            title={t('products.wizardStep1Title')}
                        >
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
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                error={errors.name}
                            />

                            <AdminInputField
                                label={t('products.subtitle')}
                                value={data.sub_title}
                                onChange={(e) =>
                                    setData('sub_title', e.target.value)
                                }
                            />

                            <AdminTextareaField
                                label={t('products.descriptionLabel')}
                                rows={4}
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
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
                                    label={t('products.gender')}
                                    value={data.gender}
                                    onChange={(value) =>
                                        setData('gender', value)
                                    }
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

                            <AdminButton
                                type="button"
                                onClick={() => setStep(2)}
                                disabled={!stepOneValid}
                            >
                                {t('products.wizardNext')}
                            </AdminButton>
                        </AdminFormSection>
                    ) : (
                        <AdminFormSection
                            title={t('products.wizardStep2Title')}
                        >
                            <div className="grid gap-4 tablet:grid-cols-2">
                                <AdminInputField
                                    label={t('products.colorwayCode')}
                                    value={data.colorway_code}
                                    onChange={(e) =>
                                        setData('colorway_code', e.target.value)
                                    }
                                    error={errors.colorway_code}
                                />
                                <AdminInputField
                                    label={t('products.colorName')}
                                    value={data.color_name}
                                    onChange={(e) =>
                                        setData('color_name', e.target.value)
                                    }
                                    error={errors.color_name}
                                />
                            </div>

                            <AdminInputField
                                label={t('products.discountPrice')}
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.discount_price}
                                onChange={(e) =>
                                    setData('discount_price', e.target.value)
                                }
                            />

                            <SizeChipPicker value={sizes} onChange={setSizes} />

                            <AdminCard className="bg-[var(--admin-neutral)] p-4">
                                <p className="text-admin-secondary text-sm">
                                    {t('products.skuPreview')}
                                </p>
                                {skuPreview.length > 0 ? (
                                    <ul className="mt-2 space-y-1 text-sm text-[var(--admin-primary)]">
                                        {skuPreview.map((sku) => (
                                            <li key={sku}>{sku}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-admin-secondary mt-2 text-sm">
                                        {t('products.skuPreviewEmpty')}
                                    </p>
                                )}
                            </AdminCard>

                            {(errors as Record<string, string | undefined>)
                                .sizes && (
                                <p className="text-xs text-red-600">
                                    {(errors as Record<string, string>).sizes}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-3">
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setStep(1)}
                                >
                                    {t('products.wizardBack')}
                                </AdminButton>
                                <AdminButton
                                    type="submit"
                                    disabled={
                                        processing ||
                                        sizes.length === 0 ||
                                        !data.colorway_code ||
                                        !data.color_name
                                    }
                                >
                                    {t('products.create')}
                                </AdminButton>
                            </div>
                        </AdminFormSection>
                    )}
                </form>
            </div>
        </>
    );
}
