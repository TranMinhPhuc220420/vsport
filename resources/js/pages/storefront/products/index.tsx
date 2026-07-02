import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { StorefrontPagination } from '@/components/storefront/pagination';
import { PlpSubNav } from '@/components/storefront/plp-sub-nav';
import { ProductCard } from '@/components/storefront/ProductCard';
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

export default function ProductListingPage({
    products,
    filters,
    categoryMeta,
    filterOptions,
    seo,
}: ProductListingPageProps) {
    const { t } = useTranslation('storefront');
    const [filtersVisible, setFiltersVisible] = useState(true);

    return (
        <>
            <PageSeo seo={seo} />

            <PlpSubNav
                categoryMeta={categoryMeta}
                filters={filters}
                filtersVisible={filtersVisible}
                onToggleFilters={() => setFiltersVisible((v) => !v)}
            />

            <div className="storefront-container storefront-section-compact">
                <div className="flex gap-8">
                    <FilterSidebar
                        categorySlug={categoryMeta.slug}
                        activeGender={filters.gender}
                        genders={filterOptions.genders}
                        childCategories={filterOptions.childCategories}
                        visible={filtersVisible}
                        onToggle={() => setFiltersVisible(false)}
                    />

                    <div className="min-w-0 flex-1">
                        <h1 className="text-heading-xl mb-4 text-ink">
                            {categoryMeta.name}
                        </h1>

                        {products.data.length === 0 ? (
                            <p className="text-body-strong text-mute">
                                {t('plp.noProducts')}
                            </p>
                        ) : (
                            <div className="storefront-grid motion-stagger-children">
                                {products.data.map((product, index) => (
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
                                            imageUrl={product.primaryImage?.url}
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
                        )}

                        <StorefrontPagination
                            links={products.links}
                            meta={products.meta}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
