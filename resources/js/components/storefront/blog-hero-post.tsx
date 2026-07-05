import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import type { BlogPostCardData } from '@/components/storefront/blog-post-card';
import { StorefrontButton } from '@/components/storefront/Button';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { formatDateTime, useLocale } from '@/hooks/use-locale';

type BlogHeroPostProps = {
    post: BlogPostCardData;
};

export function BlogHeroPost({ post }: BlogHeroPostProps) {
    const { t } = useTranslation('storefront');
    const { locale } = useLocale();

    const publishedLabel = post.publishedAt
        ? formatDateTime(post.publishedAt, locale, {
              dateStyle: 'long',
          })
        : null;

    const metaParts = [
        publishedLabel,
        t('blog.readingTime', { minutes: post.readingTimeMinutes }),
        post.authorName,
    ].filter(Boolean);

    return (
        <section
            data-slot="blog-hero-post"
            className="relative aspect-[4/5] w-full overflow-hidden bg-soft-cloud tablet:aspect-[16/7]"
        >
            {post.featuredImageUrl ? (
                <>
                    <img
                        src={post.featuredImageUrl}
                        alt={post.featuredImageAlt ?? post.title}
                        className="motion-hero-ken-burns hidden size-full object-cover tablet:block"
                    />
                    <img
                        src={post.featuredImageUrl}
                        alt={post.featuredImageAlt ?? post.title}
                        className="size-full object-cover tablet:hidden"
                    />
                </>
            ) : (
                <div className="flex size-full items-center justify-center bg-soft-cloud">
                    <span className="text-display-campaign text-mute">
                        {post.title.slice(0, 1)}
                    </span>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent" />

            <div className="storefront-container absolute inset-0 z-10 flex flex-col justify-end pb-8 tablet:pb-12">
                <ScrollReveal delay={80}>
                    {post.category && (
                        <p className="text-caption-md text-canvas/80">
                            {post.category.name}
                        </p>
                    )}
                    <h2 className="text-display-campaign mt-2 max-w-4xl text-canvas">
                        <Link
                            href={`/blog/${post.slug}`}
                            className="hover:underline"
                        >
                            {post.title}
                        </Link>
                    </h2>
                    <p className="text-body-strong mt-4 max-w-2xl text-canvas/80">
                        {post.excerpt}
                    </p>
                    <p className="text-caption-md mt-3 text-canvas/70">
                        {metaParts.join(' · ')}
                    </p>
                    <div className="mt-6 w-fit">
                        <StorefrontButton variant="outline-on-image" asChild>
                            <Link href={`/blog/${post.slug}`}>
                                {t('blog.readArticle')}
                            </Link>
                        </StorefrontButton>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}
