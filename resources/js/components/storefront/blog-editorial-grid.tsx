import {
    BlogPostCard,
    type BlogPostCardData,
} from '@/components/storefront/blog-post-card';
import { BlogBentoGrid } from '@/components/storefront/blog-bento-grid';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { splitPostsForBentoGrid } from '@/lib/blog-editorial-layout';
import { cn } from '@/lib/utils';

type BlogEditorialGridProps = {
    posts: BlogPostCardData[];
    mode: 'magazine' | 'archive';
    className?: string;
};

function BlogArchiveGrid({
    posts,
    className,
}: {
    posts: BlogPostCardData[];
    className?: string;
}) {
    const [lead, ...rest] = posts;

    return (
        <div className={cn('storefront-container space-y-10', className)}>
            {lead && (
                <ScrollReveal>
                    <BlogPostCard post={lead} layout="horizontal" />
                </ScrollReveal>
            )}

            {rest.length > 0 && (
                <div className="grid grid-cols-1 gap-10 tablet:grid-cols-2 desktop:grid-cols-3">
                    {rest.map((post, index) => (
                        <ScrollReveal key={post.id} delay={index * 40}>
                            <BlogPostCard post={post} layout="vertical" />
                        </ScrollReveal>
                    ))}
                </div>
            )}
        </div>
    );
}

function RemainingPostsGridFixed({
    posts,
    className,
}: {
    posts: BlogPostCardData[];
    className?: string;
}) {
    if (posts.length === 0) {
        return null;
    }

    const chunks: BlogPostCardData[][] = [];
    let i = 0;

    while (i < posts.length) {
        if (i > 0 && i % 6 === 0) {
            chunks.push([posts[i]!]);
            i += 1;
        } else {
            const end = Math.min(i + 3, posts.length);
            const slice = posts.slice(i, end);
            if (slice.length > 0) {
                chunks.push(slice);
            }
            i = end;
        }
    }

    return (
        <div className={cn('space-y-10', className)}>
            {chunks.map((chunk, chunkIndex) => (
                <ScrollReveal
                    key={chunk.map((p) => p.id).join('-')}
                    delay={chunkIndex * 60}
                >
                    {chunk.length === 1 && chunkIndex > 0 ? (
                        <BlogPostCard post={chunk[0]!} layout="horizontal" />
                    ) : (
                        <div className="grid grid-cols-1 gap-10 tablet:grid-cols-2 desktop:grid-cols-3">
                            {chunk.map((post) => (
                                <BlogPostCard
                                    key={post.id}
                                    post={post}
                                    layout="vertical"
                                />
                            ))}
                        </div>
                    )}
                </ScrollReveal>
            ))}
        </div>
    );
}

export function BlogEditorialGrid({
    posts,
    mode,
    className,
}: BlogEditorialGridProps) {
    if (posts.length === 0) {
        return null;
    }

    if (mode === 'archive') {
        return <BlogArchiveGrid posts={posts} className={className} />;
    }

    const { lead, grid, remaining } = splitPostsForBentoGrid(posts);

    return (
        <div className={cn('space-y-10 tablet:space-y-12', className)}>
            <div className="storefront-container">
                <BlogBentoGrid lead={lead} grid={grid} />
            </div>

            {remaining.length > 0 && (
                <div className="storefront-container">
                    <RemainingPostsGridFixed posts={remaining} />
                </div>
            )}
        </div>
    );
}

export { splitPostsForBentoGrid };
