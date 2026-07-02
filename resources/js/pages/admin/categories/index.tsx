import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
    AdminDataTable,
    AdminDataTableBody,
    AdminDataTableCell,
    AdminDataTableHead,
    AdminDataTableHeaderCell,
    AdminDataTableHeaderRow,
    AdminDataTableRow,
} from '@/components/admin/ui/admin-data-table';
import { AdminButton } from '@/components/admin/ui/admin-button';

type CategoryRow = {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    parentName?: string | null;
    productsCount: number;
    childrenCount: number;
};

type AdminCategoriesIndexProps = {
    categories: { data: CategoryRow[] };
};

export default function AdminCategoriesIndex({
    categories,
}: AdminCategoriesIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.categories'), href: '/admin/categories' },
        ],
    });

    const destroy = (id: number) => {
        if (!confirm(t('categories.deleteConfirm'))) {
            return;
        }

        router.delete(`/admin/categories/${id}`);
    };

    return (
        <>
            <Head title={t('categories.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('categories.title')}
                    subtitle={t('categories.description')}
                    actions={
                        <AdminButton asChild>
                            <Link href="/admin/categories/create">
                                {t('categories.new')}
                            </Link>
                        </AdminButton>
                    }
                />

                <AdminDataTable>
                    <AdminDataTableHead>
                        <AdminDataTableHeaderRow>
                            <AdminDataTableHeaderCell>
                                {t('products.name')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('products.slug')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('categories.parent')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('categories.products')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell className="text-right">
                                {tCommon('actions')}
                            </AdminDataTableHeaderCell>
                        </AdminDataTableHeaderRow>
                    </AdminDataTableHead>
                    <AdminDataTableBody>
                        {categories.data.map((category) => (
                            <AdminDataTableRow key={category.id}>
                                <AdminDataTableCell className="font-medium text-[var(--admin-primary)]">
                                    {category.name}
                                </AdminDataTableCell>
                                <AdminDataTableCell className="text-admin-secondary">
                                    {category.slug}
                                </AdminDataTableCell>
                                <AdminDataTableCell className="text-admin-secondary">
                                    {category.parentName ?? tCommon('emDash')}
                                </AdminDataTableCell>
                                <AdminDataTableCell>
                                    {category.productsCount}
                                </AdminDataTableCell>
                                <AdminDataTableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link
                                            href={`/admin/categories/${category.id}/edit`}
                                            className="text-sm text-admin-secondary hover:text-[var(--admin-primary)] hover:underline"
                                        >
                                            {tCommon('edit')}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => destroy(category.id)}
                                            className="text-sm text-red-600 hover:underline"
                                        >
                                            {tCommon('delete')}
                                        </button>
                                    </div>
                                </AdminDataTableCell>
                            </AdminDataTableRow>
                        ))}
                    </AdminDataTableBody>
                </AdminDataTable>
            </div>
        </>
    );
}
