import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { BlogPostForm } from '@/components/admin/blog-post-form';

type BlogPostData = {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    bodyHtml: string | null;
    featuredImageUrl: string | null;
    featuredImageAlt: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    status: 'draft' | 'published';
    isFeatured: boolean;
    publishedAt: string | null;
    authorName: string;
    category: { id: number; name: string; slug: string } | null;
    tags: { id: number; name: string; slug: string }[];
    products: { id: number; name: string; slug: string }[];
};

type AdminBlogPostsEditProps = {
    post: BlogPostData;
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    productOptions: { id: number; name: string; slug: string }[];
    statusOptions: string[];
};

export default function AdminBlogPostsEdit({
    post,
    categories,
    tags,
    productOptions,
    statusOptions,
}: AdminBlogPostsEditProps) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.blogPosts'),
                href: '/admin/blog-posts',
            },
            {
                title: t('breadcrumb.edit'),
                href: `/admin/blog-posts/${post.slug}/edit`,
            },
        ],
    });

    return (
        <BlogPostForm
            mode="edit"
            postSlug={post.slug}
            viewPostHref={
                post.status === 'published' ? `/blog/${post.slug}` : undefined
            }
            action={`/admin/blog-posts/${post.slug}`}
            method="put"
            categories={categories}
            tags={tags}
            productOptions={productOptions}
            statusOptions={statusOptions}
            featuredImageUrl={post.featuredImageUrl}
            featuredImageAlt={post.featuredImageAlt}
            initial={{
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                bodyHtml: post.bodyHtml ?? '',
                blogCategoryId: post.category?.id ?? '',
                tagIds: post.tags.map((tag) => tag.id),
                productIds: post.products.map((product) => product.id),
                metaTitle: post.metaTitle ?? '',
                metaDescription: post.metaDescription ?? '',
                status: post.status,
                isFeatured: post.isFeatured,
                publishedAt: post.publishedAt
                    ? post.publishedAt.slice(0, 16)
                    : '',
                authorName: post.authorName,
            }}
        />
    );
}
