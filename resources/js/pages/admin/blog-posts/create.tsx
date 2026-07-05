import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { BlogPostForm } from '@/components/admin/blog-post-form';

type AdminBlogPostsCreateProps = {
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    productOptions: { id: number; name: string; slug: string }[];
    statusOptions: string[];
};

export default function AdminBlogPostsCreate({
    categories,
    tags,
    productOptions,
    statusOptions,
}: AdminBlogPostsCreateProps) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.blogPosts'),
                href: '/admin/blog-posts',
            },
            {
                title: t('breadcrumb.create'),
                href: '/admin/blog-posts/create',
            },
        ],
    });

    return (
        <BlogPostForm
            mode="create"
            action="/admin/blog-posts"
            method="post"
            categories={categories}
            tags={tags}
            productOptions={productOptions}
            statusOptions={statusOptions}
            initial={{
                title: '',
                slug: '',
                excerpt: '',
                bodyHtml: '',
                blogCategoryId: '',
                tagIds: [],
                productIds: [],
                metaTitle: '',
                metaDescription: '',
                status: 'draft',
                isFeatured: false,
                publishedAt: '',
                authorName: '',
            }}
        />
    );
}
