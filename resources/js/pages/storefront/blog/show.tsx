import { Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { RichTextRenderer } from '@/components/rich-text-renderer';
import { BlogArticleHero } from '@/components/storefront/blog-article-hero';
import '@/components/storefront/blog-prose.css';
import { BlogPostCard } from '@/components/storefront/blog-post-card';
import type { BlogPostCardData } from '@/components/storefront/blog-post-card';
import { BlogShareActions } from '@/components/storefront/blog-share-actions';
import { BlogTableOfContents } from '@/components/storefront/blog-table-of-contents';
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
import { injectBlogHeadingIds } from '@/lib/blog-heading-utils';
import type { ProductSummary } from '@/types/catalog';

type BlogShowPageProps = {
    post: {
        id: number;
        title: string;
        slug: string;
        excerpt: string;
        bodyHtml: string | null;
        featuredImageUrl: string | null;
        featuredImageAlt: string | null;
        publishedAt: string | null;
        readingTimeMinutes: number;
        authorName: string;
        category: {
            id: number;
            name: string;
            slug: string;
        } | null;
        tags: { id: number; name: string; slug: string }[];
        products: ProductSummary[];
    };
    relatedPosts: BlogPostCardData[];
    seo: SeoData;
    structuredData: Record<string, unknown>[];
};

export default function BlogShowPage({
    post,
    relatedPosts,
    seo,
    structuredData,
}: BlogShowPageProps) {
    const { t } = useTranslation('storefront');

    const { html: processedHtml, headings } = useMemo(
        () => injectBlogHeadingIds(post.bodyHtml ?? ''),
        [post.bodyHtml],
    );

    const breadcrumbItems = [
        { label: t('pdp.breadcrumbHome'), href: '/' },
        { label: t('blog.title'), href: '/blog' },
        ...(post.category
            ? [
                  {
                      label: post.category.name,
                      href: `/blog?category=${post.category.slug}`,
                  },
              ]
            : []),
        { label: post.title },
    ];

    const [leadRelatedPost, ...restRelatedPosts] = relatedPosts;

    return (
        <>
            <PageSeo seo={seo} />
            <StructuredData data={structuredData} />

            <BlogArticleHero
                title={post.title}
                featuredImageUrl={post.featuredImageUrl}
                featuredImageAlt={post.featuredImageAlt}
                publishedAt={post.publishedAt}
                readingTimeMinutes={post.readingTimeMinutes}
                authorName={post.authorName}
                category={post.category}
                breadcrumbItems={breadcrumbItems}
            />

            <div className="storefront-container storefront-section">
                <ScrollReveal>
                    <Link
                        href="/blog"
                        className="text-link-md text-mute hover:text-ink"
                    >
                        {t('blog.backToBlog')}
                    </Link>
                </ScrollReveal>

                <div className="mt-8 grid gap-12 desktop:grid-cols-[minmax(0,1fr)_16rem]">
                    <article className="max-w-3xl min-w-0">
                        {post.excerpt && (
                            <ScrollReveal delay={40}>
                                <p className="text-body-strong max-w-2xl text-mute">
                                    {post.excerpt}
                                </p>
                            </ScrollReveal>
                        )}

                        {post.tags.length > 0 && (
                            <ScrollReveal delay={60}>
                                <ul className="mt-6 flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <li key={tag.id}>
                                            <Link
                                                href={`/blog?tag=${tag.slug}`}
                                                className="text-caption-md rounded-pill-lg border border-hairline px-3 py-1 text-mute transition hover:border-ink hover:text-ink"
                                            >
                                                {tag.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </ScrollReveal>
                        )}

                        <BlogTableOfContents
                            headings={headings}
                            variant="mobile"
                            className="mt-8 desktop:hidden"
                        />

                        <ScrollReveal delay={80}>
                            <div className="mt-8">
                                <RichTextRenderer
                                    html={processedHtml}
                                    className="blog-prose rich-text-renderer"
                                />
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={100}>
                            <BlogShareActions
                                title={post.title}
                                className="mt-10 border-t border-hairline pt-8"
                            />
                        </ScrollReveal>

                        {post.products.length > 0 && (
                            <ScrollReveal
                                direction="up"
                                className="mt-12 border-t border-hairline pt-10"
                            >
                                <SectionHeader
                                    title={t('blog.relatedProducts')}
                                />
                                <ProductRail className="mt-6">
                                    {post.products.map((product, index) => (
                                        <ProductRailItem
                                            key={product.id}
                                            index={index}
                                        >
                                            <ProductCard
                                                href={`/products/${product.slug}`}
                                                slug={product.slug}
                                                name={product.name}
                                                subtitle={
                                                    product.subTitle ??
                                                    undefined
                                                }
                                                imageUrl={
                                                    product.primaryImage?.url
                                                }
                                                price={product.listPrice}
                                                salePrice={
                                                    product.salePrice ??
                                                    undefined
                                                }
                                                colorways={
                                                    product.colorwaySwatches
                                                }
                                                defaultVariantId={
                                                    product.defaultVariantId ??
                                                    undefined
                                                }
                                                defaultVariantPrice={
                                                    product.defaultVariantPrice ??
                                                    undefined
                                                }
                                                inStock={product.inStock}
                                            />
                                        </ProductRailItem>
                                    ))}
                                </ProductRail>
                            </ScrollReveal>
                        )}
                    </article>

                    <BlogTableOfContents
                        headings={headings}
                        variant="desktop"
                        className="hidden desktop:block"
                    />
                </div>
            </div>

            <NewsletterCta source="blog" />

            {relatedPosts.length > 0 && (
                <section className="storefront-container storefront-section-compact border-t border-hairline">
                    <ScrollReveal direction="up">
                        <SectionHeader
                            title={t('blog.relatedPosts')}
                            href="/blog"
                            viewAllLabel={t('blog.viewAll')}
                        />

                        <div className="mt-8 space-y-10">
                            {leadRelatedPost && (
                                <BlogPostCard
                                    post={leadRelatedPost}
                                    layout="horizontal"
                                />
                            )}

                            {restRelatedPosts.length > 0 && (
                                <div className="grid grid-cols-1 gap-10 tablet:grid-cols-2 desktop:grid-cols-3">
                                    {restRelatedPosts.map((relatedPost) => (
                                        <BlogPostCard
                                            key={relatedPost.id}
                                            post={relatedPost}
                                            layout="vertical"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </ScrollReveal>
                </section>
            )}
        </>
    );
}
