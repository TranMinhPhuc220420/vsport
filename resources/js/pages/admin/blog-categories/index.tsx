import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminConfirmDialog } from '@/components/admin/admin-confirm-dialog';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
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

type BlogCategoryRow = {
    id: number;
    name: string;
    slug: string;
    postsCount: number;
};

type AdminBlogCategoriesIndexProps = {
    categories: {
        data: BlogCategoryRow[];
    };
};

export default function AdminBlogCategoriesIndex({
    categories,
}: AdminBlogCategoriesIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.blogCategories'),
                href: '/admin/blog-categories',
            },
        ],
    });

    const destroy = () => {
        if (deleteSlug === null) {
            return;
        }

        router.delete(`/admin/blog-categories/${deleteSlug}`, {
            onFinish: () => setDeleteSlug(null),
        });
    };

    return (
        <>
            <Head title={t('blogCategories.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('blogCategories.title')}
                    subtitle={t('blogCategories.description')}
                    actions={
                        <AdminButton asChild>
                            <Link href="/admin/blog-categories/create">
                                {t('blogCategories.new')}
                            </Link>
                        </AdminButton>
                    }
                />

                {categories.data.length === 0 ? (
                    <AdminEmptyState
                        title={t('blogCategories.emptyTitle')}
                        description={t('blogCategories.emptyDescription')}
                    />
                ) : (
                    <AdminDataTable>
                        <AdminDataTableHead>
                            <AdminDataTableHeaderRow>
                                <AdminDataTableHeaderCell>
                                    {t('blogCategories.name')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {t('blogCategories.slug')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {t('blogCategories.postsCount')}
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
                                    <AdminDataTableCell>
                                        {category.postsCount}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <AdminRowActionLink
                                                href={`/admin/blog-categories/${category.slug}/edit`}
                                            >
                                                {tCommon('edit')}
                                            </AdminRowActionLink>
                                            <AdminRowActionLink
                                                variant="danger"
                                                onClick={() =>
                                                    setDeleteSlug(category.slug)
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
                )}
            </div>

            <AdminConfirmDialog
                open={deleteSlug !== null}
                onOpenChange={(open) => !open && setDeleteSlug(null)}
                title={t('blogCategories.deleteConfirm')}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={destroy}
            />
        </>
    );
}
