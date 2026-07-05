import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { BlogCategoryForm } from '@/components/admin/blog-category-form';

export default function AdminBlogCategoriesCreate() {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.blogCategories'),
                href: '/admin/blog-categories',
            },
            {
                title: t('breadcrumb.create'),
                href: '/admin/blog-categories/create',
            },
        ],
    });

    return (
        <BlogCategoryForm
            mode="create"
            action="/admin/blog-categories"
            method="post"
            initial={{
                name: '',
                slug: '',
                description: '',
                sortOrder: 0,
            }}
        />
    );
}
