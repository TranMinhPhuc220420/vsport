import type { BlogPostCardData } from '@/components/storefront/blog-post-card';

export type BentoGridSplit = {
    lead: BlogPostCardData | null;
    grid: BlogPostCardData[];
    remaining: BlogPostCardData[];
};

export function splitPostsForBentoGrid(
    posts: BlogPostCardData[],
): BentoGridSplit {
    if (posts.length === 0) {
        return { lead: null, grid: [], remaining: [] };
    }

    return {
        lead: posts[0] ?? null,
        grid: posts.slice(1, 5),
        remaining: posts.slice(5),
    };
}
