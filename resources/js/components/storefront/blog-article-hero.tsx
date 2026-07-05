import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { BlogShareActions } from '@/components/storefront/blog-share-actions';
import {
    Breadcrumb,
    type BreadcrumbItem,
} from '@/components/storefront/breadcrumb';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { formatDateTime, useLocale } from '@/hooks/use-locale';

type BlogArticleHeroProps = {
    title: string;
    featuredImageUrl: string | null;
    featuredImageAlt: string | null;
    publishedAt: string | null;
    readingTimeMinutes: number;
    authorName: string;
    category: {
        name: string;
        slug: string;
    } | null;
    breadcrumbItems: BreadcrumbItem[];
};

export function BlogArticleHero({
    title,
    featuredImageUrl,
    featuredImageAlt,
    publishedAt,
    readingTimeMinutes,
    authorName,
    category,
    breadcrumbItems,
}: BlogArticleHeroProps) {
    const { t } = useTranslation('storefront');
    const { locale } = useLocale();
    const hasImage = Boolean(featuredImageUrl);

    const publishedLabel = publishedAt
        ? formatDateTime(publishedAt, locale, {
              dateStyle: 'long',
          })
        : null;

    const metaParts = [
        publishedLabel,
        t('blog.readingTime', { minutes: readingTimeMinutes }),
        authorName,
    ].filter(Boolean);

    return (
        <section
            data-slot="blog-article-hero"
            className="relative aspect-[4/5] w-full overflow-hidden bg-soft-cloud tablet:aspect-[16/7]"
        >
            {hasImage ? (
                <>
                    <img
                        src={featuredImageUrl!}
                        alt={featuredImageAlt ?? title}
                        className="motion-hero-ken-burns hidden size-full object-cover tablet:block"
                    />
                    <img
                        src={featuredImageUrl!}
                        alt={featuredImageAlt ?? title}
                        className="size-full object-cover tablet:hidden"
                    />
                </>
            ) : (
                <div className="flex size-full items-center justify-center bg-soft-cloud">
                    <span className="text-display-campaign text-mute">
                        {title.slice(0, 1)}
                    </span>
                </div>
            )}

            <div
                className={
                    hasImage
                        ? 'absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent'
                        : 'absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/20 to-transparent'
                }
            />

            <div className="storefront-container absolute inset-0 z-10 flex flex-col justify-end pb-8 tablet:pb-12">
                <ScrollReveal delay={80}>
                    <Breadcrumb
                        items={breadcrumbItems}
                        tone="inverse"
                        className="mb-4"
                    />

                    {category && (
                        <Link
                            href={`/blog?category=${category.slug}`}
                            className="text-caption-md text-canvas/80 hover:text-canvas hover:underline"
                        >
                            {category.name}
                        </Link>
                    )}

                    <h1 className="text-display-campaign mt-2 max-w-4xl text-canvas">
                        {title}
                    </h1>

                    <BlogShareActions
                        title={title}
                        tone="on-image"
                        className="mt-4"
                    />

                    <p className="text-caption-md mt-4 text-canvas/70">
                        {metaParts.join(' · ')}
                    </p>
                </ScrollReveal>
            </div>
        </section>
    );
}
