import { useTranslation } from 'react-i18next';

import { BlogBentoGrid } from '@/components/storefront/blog-bento-grid';
import {
    BlogPostCard,
    type BlogPostCardData,
} from '@/components/storefront/blog-post-card';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { SectionHeader } from '@/components/storefront/section-header';
import { splitPostsForBentoGrid } from '@/lib/blog-editorial-layout';
import { cn } from '@/lib/utils';

type BlogFeaturedRailProps = {
    posts: BlogPostCardData[];
    className?: string;
};

export function BlogFeaturedRail({ posts, className }: BlogFeaturedRailProps) {
    const { t } = useTranslation('storefront');

    if (posts.length === 0) {
        return null;
    }

    const { lead, grid, remaining: tail } = splitPostsForBentoGrid(posts);

    return (
        <section
            data-slot="blog-featured-rail"
            className={cn(
                'storefront-container storefront-section-compact overflow-hidden',
                className,
            )}
        >
            <ScrollReveal direction="up">
                <p className="text-caption-md text-mute">{t('blog.eyebrow')}</p>
                <SectionHeader
                    className="mt-2"
                    title={t('blog.title')}
                    href="/blog"
                    viewAllLabel={t('blog.viewAll')}
                />
            </ScrollReveal>

            <BlogBentoGrid className="mt-8" lead={lead} grid={grid} />

            {tail.length > 0 && (
                <div className="mt-8 space-y-8">
                    {tail.map((post, index) => (
                        <ScrollReveal key={post.id} delay={index * 60}>
                            <BlogPostCard post={post} layout="horizontal" />
                        </ScrollReveal>
                    ))}
                </div>
            )}
        </section>
    );
}

export { splitPostsForBentoGrid as splitPostsForHomepageRail };
