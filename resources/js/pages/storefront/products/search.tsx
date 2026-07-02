import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { PageSeo, type SeoData } from '@/components/storefront/page-seo';
import { StorefrontPagination } from '@/components/storefront/pagination';
import { ProductCard } from '@/components/storefront/ProductCard';
import type { Paginated, ProductSummary } from '@/types/catalog';

type ProductSearchPageProps = {
    query: string | null;
    products: Paginated<ProductSummary> | null;
    seo: SeoData;
};

export default function ProductSearchPage({
    query,
    products,
    seo,
}: ProductSearchPageProps) {
    const { t } = useTranslation('storefront');

    return (
        <>
            <PageSeo seo={seo} />

            <div className="storefront-container storefront-section">
                <h1 className="text-heading-xl text-ink">
                    {query
                        ? t('search.resultsFor', { query })
                        : t('search.title')}
                </h1>

                {!query ? (
                    <p className="mt-6 text-body-strong text-mute">
                        {t('search.noQuery')}
                    </p>
                ) : products === null || products.data.length === 0 ? (
                    <p className="mt-6 text-body-strong text-mute">
                        {t('search.noProducts')}
                    </p>
                ) : (
                    <>
                        <div className="storefront-grid mt-6">
                            {products.data.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    name={product.name}
                                    subtitle={product.subTitle ?? undefined}
                                    imageUrl={product.primaryImage?.url}
                                    price={product.listPrice}
                                    salePrice={product.salePrice ?? undefined}
                                    colorways={product.colorwaySwatches}
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
                    <p className="mt-8 text-caption-md text-mute">
                        <Link href="/" className="underline">
                            {t('plp.home')}
                        </Link>
                    </p>
                )}
            </div>
        </>
    );
}
