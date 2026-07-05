import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
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

type BrandRow = {
    id: number;
    name: string;
    slug: string;
    productsCount: number;
};

type AdminBrandsIndexProps = {
    brands: { data: BrandRow[] };
};

export default function AdminBrandsIndex({ brands }: AdminBrandsIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [deleteId, setDeleteId] = useState<number | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.brands'), href: '/admin/brands' },
        ],
    });

    const destroy = () => {
        if (deleteId === null) {
            return;
        }

        router.delete(`/admin/brands/${deleteId}`, {
            onFinish: () => setDeleteId(null),
        });
    };

    return (
        <>
            <Head title={t('brands.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('brands.title')}
                    subtitle={t('brands.description')}
                    actions={
                        <AdminButton asChild>
                            <Link href="/admin/brands/create">
                                {t('brands.new')}
                            </Link>
                        </AdminButton>
                    }
                />

                {errors.brand && (
                    <div
                        className="rounded-admin-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        role="alert"
                    >
                        {errors.brand}
                    </div>
                )}

                {brands.data.length === 0 ? (
                    <AdminEmptyState
                        title={t('brands.emptyTitle')}
                        description={t('brands.emptyDescription')}
                    />
                ) : (
                    <AdminDataTable>
                        <AdminDataTableHead>
                            <AdminDataTableHeaderRow>
                                <AdminDataTableHeaderCell>
                                    {t('brands.name')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {t('brands.slug')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {t('brands.productsCount')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell className="text-right">
                                    {tCommon('actions')}
                                </AdminDataTableHeaderCell>
                            </AdminDataTableHeaderRow>
                        </AdminDataTableHead>
                        <AdminDataTableBody>
                            {brands.data.map((brand) => (
                                <AdminDataTableRow key={brand.id}>
                                    <AdminDataTableCell className="font-medium text-[var(--admin-primary)]">
                                        {brand.name}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-admin-secondary">
                                        {brand.slug}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell>
                                        {brand.productsCount}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <AdminRowActionLink
                                                href={`/admin/brands/${brand.id}/edit`}
                                            >
                                                {tCommon('edit')}
                                            </AdminRowActionLink>
                                            <AdminRowActionLink
                                                variant="danger"
                                                onClick={() =>
                                                    setDeleteId(brand.id)
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
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={t('brands.deleteConfirm')}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={destroy}
            />
        </>
    );
}
