import { Link } from '@inertiajs/react';
import { type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { CampaignHeroCarousel } from '@/components/storefront/campaign-hero-carousel';
import { CategoryTile } from '@/components/storefront/category-tile';
import { PageSeo, type SeoData } from '@/components/storefront/page-seo';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductRail, ProductRailItem } from '@/components/storefront/product-rail';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import type {
    Campaign,
    Category,
    ProductSummary,
} from '@/types/catalog';

type HomePageProps = {
    featuredProducts: { data: ProductSummary[] };
    categories: { data: Category[] };
    campaigns: Campaign[];
    seo: SeoData;
};

export default function HomePage({
    featuredProducts,
    categories,
    campaigns,
    seo,
}: HomePageProps) {
    const { t } = useTranslation('storefront');

    return (
        <>
            <PageSeo seo={seo} />

            <CampaignHeroCarousel campaigns={campaigns} />

            <section className="storefront-container storefront-section-compact">
                <ScrollReveal>
                    <div className="flex items-baseline justify-between gap-4">
                        <h2 className="text-heading-xl text-ink">
                            {t('home.featured')}
                        </h2>
                        <Link
                            href="/men"
                            className="text-caption-md text-ink underline"
                        >
                            {t('home.viewAll')}
                        </Link>
                    </div>
                    <ProductRail className="mt-6">
                        {featuredProducts.data.map((product, index) => (
                            <ProductRailItem key={product.id} index={index}>
                                <ProductCard
                                    href={`/products/${product.slug}`}
                                    name={product.name}
                                    subtitle={product.subTitle ?? undefined}
                                    imageUrl={product.primaryImage?.url}
                                    price={product.listPrice}
                                    salePrice={product.salePrice ?? undefined}
                                    colorways={product.colorwaySwatches}
                                />
                            </ProductRailItem>
                        ))}
                    </ProductRail>
                </ScrollReveal>
            </section>

            <section className="storefront-container storefront-section-compact">
                <ScrollReveal staggerChildren>
                    <h2 className="text-heading-xl text-ink">
                        {t('home.shopByCategory')}
                    </h2>
                    <div className="mt-6 grid grid-cols-1 gap-2 tablet:grid-cols-2 desktop:grid-cols-4">
                        {categories.data.map((category, index) => (
                            <div
                                key={category.id}
                                style={{ '--stagger-index': index } as CSSProperties}
                            >
                                <CategoryTile
                                    name={category.name}
                                    slug={category.slug}
                                />
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </section>
        </>
    );
}
