import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    AdminActiveBadge,
    AdminTabs,
} from '@/components/admin/admin-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { AddColorwayForm } from '@/pages/admin/products/components/add-colorway-form';
import { ColorwayCard } from '@/pages/admin/products/components/colorway-card';
import { ColorwayInventoryGrid } from '@/pages/admin/products/components/colorway-inventory-grid';
import { ProductDetailsForm } from '@/pages/admin/products/components/product-details-form';
import {
    getProductTotalStock,
    productHasActiveColorway,
    type AdminProduct,
} from '@/types/admin-product';

type AdminProductsEditProps = {
    product: AdminProduct;
    categories: { id: number; name: string }[];
    genders: string[];
    activeTab?: string;
};

export default function AdminProductsEdit({
    product,
    categories,
    genders,
    activeTab = 'details',
}: AdminProductsEditProps) {
    const { t } = useTranslation('admin');
    const [tab, setTab] = useState(activeTab);

    useEffect(() => {
        setTab(activeTab);
    }, [activeTab]);

    const totalStock = getProductTotalStock(product);
    const isActive = productHasActiveColorway(product);

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
                            <span className="inline-flex items-center rounded-md border border-admin bg-[var(--admin-neutral)] px-2 py-1 text-xs text-admin-secondary">
                                {t('products.colorwaysCount', {
                                    count: product.colorways.length,
                                })}
                            </span>
                            <span className="inline-flex items-center rounded-md border border-admin bg-[var(--admin-neutral)] px-2 py-1 text-xs text-admin-secondary">
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
                                    genders={genders}
                                />
                            ),
                        },
                        {
                            value: 'colorways',
                            label: t('products.tabColorways'),
                            content: (
                                <div className="space-y-4">
                                    {product.colorways.length === 0 ? (
                                        <p className="text-sm text-admin-secondary">
                                            {t('products.noColorways')}
                                        </p>
                                    ) : (
                                        product.colorways.map((colorway) => (
                                            <ColorwayCard
                                                key={colorway.id}
                                                colorway={colorway}
                                                productName={product.name}
                                            />
                                        ))
                                    )}
                                    <AddColorwayForm productSlug={product.slug} />
                                </div>
                            ),
                        },
                        {
                            value: 'inventory',
                            label: t('products.tabInventory'),
                            content: (
                                <ColorwayInventoryGrid
                                    colorways={product.colorways}
                                />
                            ),
                        },
                    ]}
                />
            </div>
        </>
    );
}
