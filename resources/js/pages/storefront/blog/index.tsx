import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { BlogEditorialGrid } from '@/components/storefront/blog-editorial-grid';
import type { BlogPostCardData } from '@/components/storefront/blog-post-card';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { StorefrontPagination } from '@/components/storefront/pagination';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import type { PaginationMeta } from '@/types/catalog';

type BlogCategory = {
    id: number;
    name: string;
    slug: string;
};

type BlogTag = {
    id: number;
    name: string;
    slug: string;
};

type BlogIndexPageProps = {
    posts: {
        data: BlogPostCardData[];
        links: {
            first: string | null;
            last: string | null;
            prev: string | null;
            next: string | null;
        };
        meta: PaginationMeta;
    };
    categories: BlogCategory[];
    filters: {
        category: string | null;
        tag: string | null;
    };
    activeTag: BlogTag | null;
    seo: SeoData;
};

export default function BlogIndexPage({
    posts,
    categories,
    filters,
    activeTag,
    seo,
}: BlogIndexPageProps) {
    const { t } = useTranslation('storefront');

    const setCategory = (slug: string | null) => {
        router.get(
            '/blog',
            { category: slug ?? undefined, tag: undefined },
            { preserveState: true },
        );
    };

    const clearTagFilter = () => {
        router.get(
            '/blog',
            { category: filters.category ?? undefined },
            { preserveState: true },
        );
    };

    const isMagazineMode =
        filters.category === null &&
        filters.tag === null &&
        posts.meta.current_page === 1;

    const activeCategory = filters.category
        ? categories.find((category) => category.slug === filters.category)
        : null;

    const pageTitle =
        activeTag?.name ?? activeCategory?.name ?? t('blog.title');
    const showDescription = filters.category === null && filters.tag === null;

    return (
        <>
            <PageSeo seo={seo} />

            <div className="storefront-container storefront-section">
                <ScrollReveal>
                    <div className="flex items-baseline justify-between gap-4">
                        <div className="max-w-3xl">
                            <p className="text-caption-md text-mute">
                                {activeTag
                                    ? t('blog.tagFilterEyebrow')
                                    : t('blog.eyebrow')}
                            </p>
                            <h1 className="text-display-campaign mt-3 text-ink">
                                {pageTitle}
                            </h1>
                            {showDescription && (
                                <p className="text-body-strong mt-4 text-mute">
                                    {t('blog.description')}
                                </p>
                            )}
                            {activeTag && (
                                <button
                                    type="button"
                                    onClick={clearTagFilter}
                                    className="text-link-md mt-4 text-mute hover:text-ink"
                                >
                                    {t('blog.clearTagFilter')}
                                </button>
                            )}
                        </div>
                        {(activeCategory || activeTag) &&
                            posts.data.length > 0 && (
                                <span className="text-caption-md shrink-0 text-mute">
                                    {t('blog.postCount', {
                                        count: posts.meta.total,
                                    })}
                                </span>
                            )}
                    </div>
                </ScrollReveal>

                {categories.length > 0 && (
                    <div className="sticky top-14 z-30 -mx-4 mt-8 bg-canvas/95 px-4 py-3 backdrop-blur-sm tablet:-mx-6 tablet:px-6">
                        <ScrollReveal delay={60}>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCategory(null)}
                                    className={
                                        filters.category === null &&
                                        filters.tag === null
                                            ? 'text-caption-md rounded-pill-lg bg-ink px-4 py-2 text-canvas'
                                            : 'text-caption-md rounded-pill-lg border border-hairline px-4 py-2 text-mute hover:border-ink hover:text-ink'
                                    }
                                >
                                    {t('blog.allCategories')}
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() =>
                                            setCategory(category.slug)
                                        }
                                        className={
                                            filters.category === category.slug
                                                ? 'text-caption-md rounded-pill-lg bg-ink px-4 py-2 text-canvas'
                                                : 'text-caption-md rounded-pill-lg border border-hairline px-4 py-2 text-mute hover:border-ink hover:text-ink'
                                        }
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                )}

                {posts.data.length === 0 && (
                    <p className="text-body mt-12 text-mute">
                        {t('blog.empty')}
                    </p>
                )}
            </div>

            {posts.data.length > 0 && (
                <BlogEditorialGrid
                    className="mt-12"
                    posts={posts.data}
                    mode={isMagazineMode ? 'magazine' : 'archive'}
                />
            )}

            {posts.data.length > 0 && (
                <div className="storefront-container pb-[var(--storefront-section-padding,3rem)]">
                    <StorefrontPagination
                        className="mt-12"
                        links={posts.links}
                        meta={posts.meta}
                    />
                </div>
            )}
        </>
    );
}
