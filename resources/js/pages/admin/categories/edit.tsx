import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { CategoryForm } from '@/components/admin/category-form';

type AdminCategoriesEditProps = {
    category: {
        id: number;
        name: string;
        slug: string;
        parentId: number | null;
    };
    parentCategories: { id: number; name: string }[];
};

export default function AdminCategoriesEdit({
    category,
    parentCategories,
}: AdminCategoriesEditProps) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.categories'), href: '/admin/categories' },
            { title: t('breadcrumb.edit'), href: '#' },
        ],
    });

    return (
        <CategoryForm
            mode="edit"
            action={`/admin/categories/${category.id}`}
            method="put"
            parentCategories={parentCategories}
            initial={{
                name: category.name,
                slug: category.slug,
                parent_id: category.parentId ?? '',
            }}
        />
    );
}
