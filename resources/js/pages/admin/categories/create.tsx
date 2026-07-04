import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { CategoryForm } from '@/components/admin/category-form';

type AdminCategoriesCreateProps = {
    parentCategories: { id: number; name: string }[];
    defaultParentId?: number | null;
};

export default function AdminCategoriesCreate({
    parentCategories,
    defaultParentId = null,
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
            initial={{
                name: '',
                slug: '',
                parent_id: defaultParentId ?? '',
            }}
        />
    );
}
