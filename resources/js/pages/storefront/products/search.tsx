import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { StorefrontPagination } from '@/components/storefront/pagination';
import { ProductCard } from '@/components/storefront/ProductCard';
import { SortSheet } from '@/components/storefront/sort-sheet';
import type { Paginated, ProductSummary } from '@/types/catalog';

type ProductSearchPageProps = {
    query: string | null;
    products: Paginated<ProductSummary> | null;
    seo: SeoData;
    sort?: string;
};

export default function ProductSearchPage({
    query,
    products,
    seo,
    sort = 'newest',
}: ProductSearchPageProps) {
    const { t } = useTranslation('storefront');
    const [sortSheetOpen, setSortSheetOpen] = useState(false);

    const sortOptions = [
        { value: 'newest', label: t('plp.sortNewest') },
        { value: 'price_asc', label: t('plp.sortPriceLow') },
        { value: 'price_desc', label: t('plp.sortPriceHigh') },
    ];

    const currentSortLabel =
        sortOptions.find((o) => o.value === sort)?.label ?? sortOptions[0].label;

    const handleSortChange = (newSort: string) => {
        router.get(
            '/search',
            { q: query ?? undefined, sort: newSort },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <>
            <PageSeo seo={seo} />

            <SortSheet
                open={sortSheetOpen}
                onOpenChange={setSortSheetOpen}
                options={sortOptions}
                value={sort}
                onChange={handleSortChange}
            />

            <div className="storefront-container storefront-section">
                <h1 className="text-heading-xl text-ink">
                    {query
                        ? t('search.resultsFor', { query })
                        : t('search.title')}
                </h1>

                {!query ? (
                    <p className="text-body-strong mt-6 text-mute">
                        {t('search.noQuery')}
                    </p>
                ) : products === null || products.data.length === 0 ? (
                    <p className="text-body-strong mt-6 text-mute">
                        {t('search.noProducts')}
                    </p>
                ) : (
                    <>
                        {/* Sort bar */}
                        <div className="mt-4 flex items-center justify-between border-b border-hairline-soft pb-4">
                            <span className="text-caption-md text-mute">
                                {t('plp.resultCount', {
                                    count: products.meta.total,
                                })}
                            </span>

                            {/* Mobile sort */}
                            <button
                                type="button"
                                onClick={() => setSortSheetOpen(true)}
                                className="text-caption-md flex items-center gap-1 tablet-lg:hidden"
                            >
                                <span className="text-mute">
                                    {t('plp.sortTitle')}:
                                </span>
                                <span className="text-ink">{currentSortLabel}</span>
                            </button>

                            {/* Desktop sort */}
                            <label className="hidden items-center gap-2 tablet-lg:flex">
                                <span className="text-caption-md text-mute">
                                    {t('plp.sortBy')}
                                </span>
                                <select
                                    value={sort}
                                    onChange={(e) =>
                                        handleSortChange(e.target.value)
                                    }
                                    className="text-button-md h-10 rounded-pill-md border border-hairline bg-canvas px-3"
                                >
                                    {sortOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className="storefront-grid mt-6">
                            {products.data.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    slug={product.slug}
                                    name={product.name}
                                    subtitle={product.subTitle ?? undefined}
                                    imageUrl={product.primaryImage?.url}
                                    price={product.listPrice}
                                    salePrice={product.salePrice ?? undefined}
                                    colorways={product.colorwaySwatches}
                                    defaultVariantId={
                                        product.defaultVariantId ?? undefined
                                    }
                                    defaultVariantPrice={
                                        product.defaultVariantPrice ?? undefined
                                    }
                                    inStock={product.inStock}
                                    badge={
                                        !product.inStock
                                            ? t('plp.outOfStock')
                                            : undefined
                                    }
                                />
                            ))}
                        </div>

                        <StorefrontPagination
                            links={products.links}
                            meta={products.meta}
                        />
                    </>
                )}

                {query && (
                    <p className="text-caption-md mt-8 text-mute">
                        <Link href="/" className="underline">
                            {t('plp.home')}
                        </Link>
                    </p>
                )}
            </div>
        </>
    );
}
