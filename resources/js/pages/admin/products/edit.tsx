import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminActiveBadge, AdminTabs } from '@/components/admin/admin-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { OptionValueImagesPanel } from '@/pages/admin/products/components/option-value-images-panel';
import { ProductAttributesEditor } from '@/pages/admin/products/components/product-attributes-editor';
import { ProductContentSectionsEditor } from '@/pages/admin/products/components/product-content-sections-editor';
import { ProductDetailsForm } from '@/pages/admin/products/components/product-details-form';
import { ProductOptionsEditor } from '@/pages/admin/products/components/product-options-editor';
import { VariantInventoryGrid } from '@/pages/admin/products/components/variant-inventory-grid';
import {
    getProductTotalStock,
    productHasActiveVariants,
} from '@/types/admin-product';
import type { AdminProduct } from '@/types/admin-product';

type AdminProductsEditProps = {
    product: AdminProduct;
    categories: { id: number; name: string }[];
    brands: { id: number; name: string }[];
    genders: string[];
    activeTab?: string;
};

export default function AdminProductsEdit({
    product,
    categories,
    brands,
    genders,
    activeTab = 'details',
}: AdminProductsEditProps) {
    const { t } = useTranslation('admin');
    const [tab, setTab] = useState(activeTab);
    const [prevActiveTab, setPrevActiveTab] = useState(activeTab);

    if (activeTab !== prevActiveTab) {
        setPrevActiveTab(activeTab);
        setTab(activeTab);
    }

    const totalStock = getProductTotalStock(product);
    const isActive = productHasActiveVariants(product);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.products'), href: '/admin/products' },
            { title: t('breadcrumb.edit'), href: '#' },
        ],
    });

    return (
        <>
            <Head title={t('products.editTitle')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/products"
                    backLabel={t('products.back')}
                    title={product.name}
                    subtitle={product.styleCode}
                    sticky
                    badges={
                        <>
                            <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
                                {t('products.variantsCount', {
                                    count: product.variants.length,
                                })}
                            </span>
                            <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
                                {t('products.totalStock', {
                                    count: totalStock,
                                })}
                            </span>
                            <AdminActiveBadge active={isActive} />
                        </>
                    }
                    actions={
                        <AdminButton asChild variant="secondary">
                            <Link
                                href={`/products/${product.slug}`}
                                target="_blank"
                            >
                                {t('products.viewStorefront')}
                            </Link>
                        </AdminButton>
                    }
                />

                <AdminTabs
                    value={tab}
                    onValueChange={setTab}
                    tabs={[
                        {
                            value: 'details',
                            label: t('products.tabDetails'),
                            content: (
                                <ProductDetailsForm
                                    product={product}
                                    categories={categories}
                                    brands={brands}
                                    genders={genders}
                                />
                            ),
                        },
                        {
                            value: 'content',
                            label: t('products.tabContent'),
                            content: (
                                <ProductContentSectionsEditor
                                    product={product}
                                />
                            ),
                        },
                        {
                            value: 'options',
                            label: t('products.tabOptions'),
                            content: <ProductOptionsEditor product={product} />,
                        },
                        {
                            value: 'images',
                            label: t('products.tabImages'),
                            content: (
                                <OptionValueImagesPanel product={product} />
                            ),
                        },
                        {
                            value: 'attributes',
                            label: t('products.tabAttributes'),
                            content: (
                                <ProductAttributesEditor product={product} />
                            ),
                        },
                        {
                            value: 'inventory',
                            label: t('products.tabInventory'),
                            content: <VariantInventoryGrid product={product} />,
                        },
                    ]}
                />
            </div>
        </>
    );
}
