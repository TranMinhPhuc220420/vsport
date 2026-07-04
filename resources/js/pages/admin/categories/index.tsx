import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminConfirmDialog } from '@/components/admin/admin-confirm-dialog';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import {
    AdminCardList,
    AdminCardListField,
    AdminCardListItem,
} from '@/components/admin/ui/admin-card-list';
import {
    AdminDataTable,
    AdminDataTableBody,
    AdminDataTableCell,
    AdminDataTableHead,
    AdminDataTableHeaderCell,
    AdminDataTableHeaderRow,
    AdminDataTableRow,
} from '@/components/admin/ui/admin-data-table';
import { AdminEmptyState } from '@/components/admin/ui/admin-empty-state';
import { AdminRowActionLink } from '@/components/admin/ui/admin-row-action-link';

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
    const [deleteId, setDeleteId] = useState<number | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.categories'), href: '/admin/categories' },
        ],
    });

    const destroy = () => {
        if (deleteId === null) {
            return;
        }

        router.delete(`/admin/categories/${deleteId}`, {
            onFinish: () => setDeleteId(null),
        });
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

                {categories.data.length === 0 ? (
                    <AdminEmptyState
                        title={t('categories.emptyTitle')}
                        description={t('categories.emptyDescription')}
                        action={
                            <AdminButton asChild variant="secondary">
                                <Link href="/admin/categories/create">
                                    {t('categories.new')}
                                </Link>
                            </AdminButton>
                        }
                    />
                ) : (
                    <>
                        <div className="hidden md:block">
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
                                                {category.parentName ??
                                                    tCommon('emDash')}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell>
                                                {category.productsCount}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <AdminRowActionLink
                                                        href={`/admin/categories/${category.id}/edit`}
                                                    >
                                                        {tCommon('edit')}
                                                    </AdminRowActionLink>
                                                    <AdminRowActionLink
                                                        variant="danger"
                                                        onClick={() =>
                                                            setDeleteId(
                                                                category.id,
                                                            )
                                                        }
                                                    >
                                                        {tCommon('delete')}
                                                    </AdminRowActionLink>
                                                </div>
                                            </AdminDataTableCell>
                                        </AdminDataTableRow>
                                    ))}
                                </AdminDataTableBody>
                            </AdminDataTable>
                        </div>

                        <AdminCardList className="md:hidden">
                            {categories.data.map((category) => (
                                <AdminCardListItem
                                    key={category.id}
                                    title={category.name}
                                    subtitle={category.slug}
                                    actions={
                                        <>
                                            <AdminRowActionLink
                                                href={`/admin/categories/${category.id}/edit`}
                                            >
                                                {tCommon('edit')}
                                            </AdminRowActionLink>
                                            <AdminRowActionLink
                                                variant="danger"
                                                onClick={() =>
                                                    setDeleteId(category.id)
                                                }
                                            >
                                                {tCommon('delete')}
                                            </AdminRowActionLink>
                                        </>
                                    }
                                >
                                    <AdminCardListField
                                        label={t('categories.parent')}
                                    >
                                        {category.parentName ??
                                            tCommon('emDash')}
                                    </AdminCardListField>
                                    <AdminCardListField
                                        label={t('categories.products')}
                                    >
                                        {category.productsCount}
                                    </AdminCardListField>
                                </AdminCardListItem>
                            ))}
                        </AdminCardList>
                    </>
                )}
            </div>

            <AdminConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={t('categories.deleteConfirm')}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={destroy}
            />
        </>
    );
}
