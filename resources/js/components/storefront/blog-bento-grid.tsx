import type { CSSProperties } from 'react';

import { BlogPostCard } from '@/components/storefront/blog-post-card';
import type { BlogPostCardData } from '@/components/storefront/blog-post-card';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { cn } from '@/lib/utils';

type BlogBentoGridProps = {
    lead: BlogPostCardData | null;
    grid: BlogPostCardData[];
    className?: string;
    leadClassName?: string;
};

export function BlogBentoGrid({
    lead,
    grid,
    className,
    leadClassName,
}: BlogBentoGridProps) {
    if (lead === null) {
        return null;
    }

    return (
        <ScrollReveal staggerChildren className={className}>
            {grid.length > 0 ? (
                <div
                    className={cn(
                        'grid grid-cols-1 gap-2',
                        'tablet:grid-cols-2',
                        'desktop:h-[clamp(38rem,52vw,48rem)] desktop:grid-cols-4 desktop:grid-rows-2 desktop:gap-0',
                    )}
                >
                    <div
                        className="h-full min-h-[22rem] desktop:col-span-2 desktop:row-span-2 desktop:min-h-0"
                        style={{ '--stagger-index': 0 } as CSSProperties}
                    >
                        <BlogPostCard
                            post={lead}
                            layout="overlay"
                            size="featured"
                            className={cn(
                                'h-full min-h-[22rem] desktop:min-h-0',
                                leadClassName,
                            )}
                        />
                    </div>
                    {grid.map((post, index) => (
                        <div
                            key={post.id}
                            className="h-full min-h-[16rem] desktop:min-h-0"
                            style={
                                {
                                    '--stagger-index': index + 1,
                                } as CSSProperties
                            }
                        >
                            <BlogPostCard
                                post={post}
                                layout="overlay"
                                size="compact"
                                className="h-full"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ '--stagger-index': 0 } as CSSProperties}>
                    <BlogPostCard
                        post={lead}
                        layout="overlay"
                        size="featured"
                        className={cn(
                            'min-h-[24rem] tablet:min-h-[28rem]',
                            leadClassName,
                        )}
                    />
                </div>
            )}
        </ScrollReveal>
    );
}
