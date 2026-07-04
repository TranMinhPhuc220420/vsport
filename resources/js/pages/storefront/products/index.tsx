import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterDrawer } from '@/components/storefront/filter-drawer';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { StorefrontPagination } from '@/components/storefront/pagination';
import { PlpSubNav } from '@/components/storefront/plp-sub-nav';
import {
    ProductCard,
    ProductCardSkeleton,
} from '@/components/storefront/ProductCard';
import type {
    CategoryMeta,
    FilterOptions,
    ListingFilters,
    Paginated,
    ProductSummary,
} from '@/types/catalog';

type ProductListingPageProps = {
    products: Paginated<ProductSummary>;
    filters: ListingFilters;
    categoryMeta: CategoryMeta;
    filterOptions: FilterOptions;
    seo: SeoData;
};

const SKELETON_COUNT = 8;

export default function ProductListingPage({
    products,
    filters,
    categoryMeta,
    filterOptions,
    seo,
}: ProductListingPageProps) {
    const { t } = useTranslation('storefront');
    const [filtersVisible, setFiltersVisible] = useState(false);

    // Load More accumulation
    const [allProducts, setAllProducts] = useState<ProductSummary[]>(products.data);
    const isLoadingMoreRef = useRef(false);
    const isMountedRef = useRef(false);

    useEffect(() => {
        if (!isMountedRef.current) {
            isMountedRef.current = true;

            return;
        }

        if (isLoadingMoreRef.current) {
            setAllProducts((prev) => [...prev, ...products.data]);
        } else {
            setAllProducts(products.data);
        }

        isLoadingMoreRef.current = false;
    }, [products]);

    // Skeleton loading (not triggered during Load More)
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', () => {
            if (!isLoadingMoreRef.current) {
setIsLoading(true);
}
        });
        const removeFinish = router.on('finish', () => setIsLoading(false));

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    const handleLoadMore = () => {
        if (!products.links.next) {
return;
}

        isLoadingMoreRef.current = true;
        router.get(products.links.next, {}, {
            preserveState: true,
            preserveScroll: true,
            onError: () => {
                isLoadingMoreRef.current = false;
            },
        });
    };

    const hasNextPage = !!products.links.next;

    return (
        <>
            <PageSeo seo={seo} />

            <PlpSubNav
                categoryMeta={categoryMeta}
                filters={filters}
                filtersVisible={filtersVisible}
                onToggleFilters={() => setFiltersVisible((v) => !v)}
            />

            {/* Mobile filter drawer (Sprint 1) */}
            <FilterDrawer
                open={filtersVisible}
                onOpenChange={setFiltersVisible}
                categorySlug={categoryMeta.slug}
                activeDepartment={filters.activeDepartment}
                sort={filters.sort}
                departments={filterOptions.departments}
                subCategories={filterOptions.subCategories}
            />

            <div className="storefront-container storefront-section-compact">
                <div className="flex gap-8">
                    {/* Desktop filter sidebar */}
                    <FilterSidebar
                        categorySlug={categoryMeta.slug}
                        activeDepartment={filters.activeDepartment}
                        sort={filters.sort}
                        departments={filterOptions.departments}
                        subCategories={filterOptions.subCategories}
                        visible={filtersVisible}
                        onToggle={() => setFiltersVisible(false)}
                    />

                    <div className="min-w-0 flex-1">
                        {/* Heading + result count (Sprint 2) */}
                        <div className="mb-4 flex items-baseline justify-between gap-4">
                            <h1 className="text-heading-xl text-ink">
                                {categoryMeta.name}
                            </h1>
                            {!isLoading && (
                                <span className="text-caption-md shrink-0 text-mute">
                                    {t('plp.resultCount', {
                                        count: products.meta.total,
                                    })}
                                </span>
                            )}
                        </div>

                        {/* Skeleton (Sprint 4) */}
                        {isLoading ? (
                            <div className="storefront-grid">
                                {Array.from({ length: SKELETON_COUNT }).map(
                                    (_, i) => (
                                        <ProductCardSkeleton key={i} />
                                    ),
                                )}
                            </div>
                        ) : allProducts.length === 0 ? (
                            <p className="text-body-strong text-mute">
                                {t('plp.noProducts')}
                            </p>
                        ) : (
                            <>
                                <div className="storefront-grid motion-stagger-children">
                                    {allProducts.map((product, index) => (
                                        <div
                                            key={product.id}
                                            style={
                                                {
                                                    '--stagger-index': index % 8,
                                                } as CSSProperties
                                            }
                                        >
                                            <ProductCard
                                                href={`/products/${product.slug}`}
                                                name={product.name}
                                                subtitle={
                                                    product.subTitle ?? undefined
                                                }
                                                imageUrl={
                                                    product.primaryImage?.url
                                                }
                                                price={product.listPrice}
                                                salePrice={
                                                    product.salePrice ?? undefined
                                                }
                                                colorways={product.colorwaySwatches}
                                                badge={
                                                    !product.inStock
                                                        ? t('plp.outOfStock')
                                                        : undefined
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Mobile: Load More (Sprint 3) */}
                                {hasNextPage && (
                                    <div className="mt-8 tablet-lg:hidden">
                                        <button
                                            type="button"
                                            onClick={handleLoadMore}
                                            className="text-button-md w-full rounded-pill-lg border border-hairline py-4 text-ink active:bg-soft-cloud"
                                        >
                                            {t('plp.loadMore')}
                                        </button>
                                    </div>
                                )}

                                {/* Desktop: numbered pagination */}
                                <div className="hidden tablet-lg:block">
                                    <StorefrontPagination
                                        links={products.links}
                                        meta={products.meta}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
