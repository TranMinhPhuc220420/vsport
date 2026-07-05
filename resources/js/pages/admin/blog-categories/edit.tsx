import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { BlogCategoryForm } from '@/components/admin/blog-category-form';

type AdminBlogCategoriesEditProps = {
    category: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
        sortOrder: number;
    };
};

export default function AdminBlogCategoriesEdit({
    category,
}: AdminBlogCategoriesEditProps) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.blogCategories'),
                href: '/admin/blog-categories',
            },
            {
                title: t('breadcrumb.edit'),
                href: `/admin/blog-categories/${category.slug}/edit`,
            },
        ],
    });

    return (
        <BlogCategoryForm
            mode="edit"
            action={`/admin/blog-categories/${category.slug}`}
            method="put"
            initial={{
                name: category.name,
                slug: category.slug,
                description: category.description ?? '',
                sortOrder: category.sortOrder,
            }}
        />
    );
}
