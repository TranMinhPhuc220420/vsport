import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { CategoryForm } from '@/components/admin/category-form';

type AdminCategoriesCreateProps = {
    parentCategories: { id: number; name: string }[];
};

export default function AdminCategoriesCreate({
    parentCategories,
}: AdminCategoriesCreateProps) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.categories'), href: '/admin/categories' },
            { title: t('breadcrumb.create'), href: '/admin/categories/create' },
        ],
    });

    return (
        <CategoryForm
            mode="create"
            action="/admin/categories"
            method="post"
            parentCategories={parentCategories}
            initial={{ name: '', slug: '', parent_id: '' }}
        />
    );
}
