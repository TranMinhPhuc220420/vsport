import { useTranslation } from 'react-i18next';

import { BlogFeaturedRail } from '@/components/storefront/blog-featured-rail';
import type { BlogPostCardData } from '@/components/storefront/blog-post-card';
import { BrandMarquee } from '@/components/storefront/brand-marquee';
import { CampaignHeroCarousel } from '@/components/storefront/campaign-hero-carousel';
import { EditorialBanner } from '@/components/storefront/editorial-banner';
import { EditorialCategoryShowcase } from '@/components/storefront/editorial-category-showcase';
import { NewsletterCta } from '@/components/storefront/newsletter-cta';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import {
    ProductRail,
    ProductRailItem,
} from '@/components/storefront/product-rail';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { SectionHeader } from '@/components/storefront/section-header';
import { StructuredData } from '@/components/storefront/structured-data';
import { TrustBar } from '@/components/storefront/trust-bar';
import type { Campaign, Category, ProductSummary } from '@/types/catalog';

type ProductCollection = {
    data: ProductSummary[];
};

type HomePageProps = {
    featuredProducts: ProductCollection;
    newArrivals: ProductCollection;
    bestSellers: ProductCollection;
    categories: { data: Category[] };
    campaigns: Campaign[];
    featuredPosts: { data: BlogPostCardData[] };
    seo: SeoData;
    structuredData: Record<string, unknown>[];
};

function ProductRailSection({
    title,
    href,
    products,
    direction = 'up',
}: {
    title: string;
    href: string;
    products: ProductSummary[];
    direction?: 'up' | 'left' | 'right';
}) {
    if (products.length === 0) {
        return null;
    }

    return (
        <section className="storefront-container storefront-section-compact overflow-hidden">
            <ScrollReveal direction={direction}>
                <SectionHeader title={title} href={href} />
                <ProductRail className="mt-6">
                    {products.map((product, index) => (
                        <ProductRailItem key={product.id} index={index}>
                            <ProductCard
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
                            />
                        </ProductRailItem>
                    ))}
                </ProductRail>
            </ScrollReveal>
        </section>
    );
}

export default function HomePage({
    featuredProducts,
    newArrivals,
    bestSellers,
    categories,
    campaigns,
    featuredPosts,
    seo,
    structuredData,
}: HomePageProps) {
    const { t } = useTranslation('storefront');

    const editorialCampaign = campaigns[1] ?? {
        headline: t('home.editorial.headline'),
        subtitle: t('home.editorial.subtitle'),
        imageUrl:
            'https://images.pexels.com/photos/47354/the-ball-stadion-football-the-pitch-47354.jpeg',
        ctaLabel: t('home.editorial.ctaLabel'),
        ctaHref: '/women',
    };

    return (
        <>
            <PageSeo seo={seo} />
            <StructuredData data={structuredData} />

            <CampaignHeroCarousel campaigns={campaigns} />

            <BrandMarquee />

            <ProductRailSection
                title={t('home.newArrivals')}
                href="/men?sort=newest"
                products={newArrivals.data}
                direction="left"
            />

            <EditorialCategoryShowcase categories={categories.data} />

            <ProductRailSection
                title={t('home.featured')}
                href="/men"
                products={featuredProducts.data}
                direction="right"
            />

            <EditorialBanner
                headline={editorialCampaign.headline}
                subtitle={editorialCampaign.subtitle}
                imageUrl={editorialCampaign.imageUrl}
                ctaLabel={editorialCampaign.ctaLabel}
                ctaHref={editorialCampaign.ctaHref}
            />

            <ProductRailSection
                title={t('home.bestSellers')}
                href="/women"
                products={bestSellers.data}
                direction="left"
            />

            <TrustBar />

            <BlogFeaturedRail posts={featuredPosts.data} />

            <NewsletterCta />
        </>
    );
}
