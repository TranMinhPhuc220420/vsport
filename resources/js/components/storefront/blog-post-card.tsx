import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { formatDateTime, useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

export type BlogPostCardData = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featuredImageUrl: string | null;
    featuredImageAlt: string | null;
    publishedAt: string | null;
    readingTimeMinutes: number;
    authorName: string;
    isFeatured?: boolean;
    category: {
        id: number;
        name: string;
        slug: string;
    } | null;
};

type BlogPostCardProps = {
    post: BlogPostCardData;
    className?: string;
    layout?: 'vertical' | 'horizontal' | 'overlay';
    size?: 'default' | 'compact' | 'featured';
};

export function BlogPostCard({
    post,
    className,
    layout = 'vertical',
    size = 'default',
}: BlogPostCardProps) {
    const { t } = useTranslation('storefront');
    const { locale } = useLocale();

    const publishedLabel = post.publishedAt
        ? formatDateTime(post.publishedAt, locale, {
              dateStyle: 'medium',
          })
        : null;

    const metaLine = [
        publishedLabel,
        t('blog.readingTime', { minutes: post.readingTimeMinutes }),
    ]
        .filter(Boolean)
        .join(' · ');

    if (layout === 'overlay') {
        const hasImage = Boolean(post.featuredImageUrl);
        const titleSizeClass =
            size === 'featured'
                ? 'text-[clamp(1.75rem,4vw,3.5rem)]'
                : 'text-[clamp(1.5rem,3vw,2.25rem)]';

        return (
            <Link
                href={`/blog/${post.slug}`}
                data-slot="blog-post-card-overlay"
                className={cn(
                    'group relative block overflow-hidden bg-soft-cloud',
                    size === 'featured'
                        ? 'h-full min-h-[22rem]'
                        : 'h-full min-h-[16rem] desktop:min-h-0',
                    className,
                )}
            >
                {hasImage ? (
                    <>
                        <img
                            src={post.featuredImageUrl!}
                            alt={post.featuredImageAlt ?? post.title}
                            loading="lazy"
                            className="motion-safe-hover-scale size-full object-cover"
                        />
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent"
                            aria-hidden
                        />
                    </>
                ) : (
                    <div className="flex size-full items-center justify-center bg-soft-cloud">
                        <span className="text-heading-xl text-mute">
                            {post.title.slice(0, 1)}
                        </span>
                    </div>
                )}

                <div className="absolute inset-x-4 bottom-4 z-10 tablet:inset-x-6 tablet:bottom-6">
                    {post.category && (
                        <p
                            className={cn(
                                'text-caption-md',
                                hasImage ? 'text-canvas/80' : 'text-mute',
                            )}
                        >
                            {post.category.name}
                        </p>
                    )}
                    <p
                        className={cn(
                            'font-[family-name:var(--font-display)] mt-2 uppercase leading-[0.95] tracking-[-0.005em]',
                            titleSizeClass,
                            hasImage
                                ? 'text-canvas drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]'
                                : 'text-ink',
                        )}
                    >
                        {post.title}
                    </p>
                    {metaLine && (
                        <p
                            className={cn(
                                'text-caption-md mt-2',
                                hasImage ? 'text-canvas/70' : 'text-stone',
                            )}
                        >
                            {metaLine}
                        </p>
                    )}
                </div>
            </Link>
        );
    }

    if (layout === 'horizontal') {
        return (
            <article
                className={cn(
                    'group grid grid-cols-1 gap-4 tablet:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] tablet:items-center',
                    className,
                )}
            >
                <Link
                    href={`/blog/${post.slug}`}
                    className="relative aspect-video overflow-hidden bg-soft-cloud tablet:aspect-[4/3]"
                >
                    {post.featuredImageUrl ? (
                        <img
                            src={post.featuredImageUrl}
                            alt={post.featuredImageAlt ?? post.title}
                            className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-soft-cloud text-mute">
                            {post.title.slice(0, 1)}
                        </div>
                    )}
                </Link>

                <div>
                    {post.category && (
                        <p className="text-caption-md text-mute">
                            {post.category.name}
                        </p>
                    )}
                    <h3 className="text-heading-md mt-2 text-ink">
                        <Link
                            href={`/blog/${post.slug}`}
                            className="hover:underline"
                        >
                            {post.title}
                        </Link>
                    </h3>
                    <p className="text-body mt-2 line-clamp-2 text-mute">
                        {post.excerpt}
                    </p>
                    <p className="text-caption-md mt-3 text-stone">
                        {metaLine}
                    </p>
                </div>
            </article>
        );
    }

    return (
        <article className={cn('group flex flex-col', className)}>
            <Link
                href={`/blog/${post.slug}`}
                className="relative aspect-video overflow-hidden bg-soft-cloud"
            >
                {post.featuredImageUrl ? (
                    <img
                        src={post.featuredImageUrl}
                        alt={post.featuredImageAlt ?? post.title}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center bg-soft-cloud text-mute">
                        {post.title.slice(0, 1)}
                    </div>
                )}
            </Link>

            <div className="mt-4 flex flex-1 flex-col">
                {post.category && (
                    <p className="text-caption-md text-mute">
                        {post.category.name}
                    </p>
                )}
                <h2 className="text-heading-md mt-2 text-ink">
                    <Link
                        href={`/blog/${post.slug}`}
                        className="hover:underline"
                    >
                        {post.title}
                    </Link>
                </h2>
                <p className="text-body mt-2 line-clamp-3 text-mute">
                    {post.excerpt}
                </p>
                <p className="text-caption-md mt-auto pt-4 text-stone">
                    {metaLine}
                </p>
            </div>
        </article>
    );
}
