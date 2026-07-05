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

type SizeGuideRow = {
    id: number;
    name: string;
    categoryName?: string | null;
    brandName?: string | null;
    isDefault: boolean;
    rowsCount: number;
};

function appliesToLabel(sizeGuide: SizeGuideRow, defaultLabel: string): string {
    if (sizeGuide.brandName && sizeGuide.categoryName) {
        return `${sizeGuide.brandName} · ${sizeGuide.categoryName}`;
    }

    if (sizeGuide.brandName) {
        return sizeGuide.brandName;
    }

    if (sizeGuide.categoryName) {
        return sizeGuide.categoryName;
    }

    return sizeGuide.isDefault ? defaultLabel : '—';
}

type AdminSizeGuidesIndexProps = {
    sizeGuides: { data: SizeGuideRow[] };
};

export default function AdminSizeGuidesIndex({
    sizeGuides,
}: AdminSizeGuidesIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const [deleteId, setDeleteId] = useState<number | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.sizeGuides'), href: '/admin/size-guides' },
        ],
    });

    const destroy = () => {
        if (deleteId === null) {
            return;
        }

        router.delete(`/admin/size-guides/${deleteId}`, {
            onFinish: () => setDeleteId(null),
        });
    };

    return (
        <>
            <Head title={t('sizeGuides.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('sizeGuides.title')}
                    subtitle={t('sizeGuides.description')}
                    actions={
                        <AdminButton asChild>
                            <Link href="/admin/size-guides/create">
                                {t('sizeGuides.new')}
                            </Link>
                        </AdminButton>
                    }
                />

                {sizeGuides.data.length === 0 ? (
                    <AdminEmptyState
                        title={t('sizeGuides.emptyTitle')}
                        description={t('sizeGuides.emptyDescription')}
                        action={
                            <AdminButton asChild variant="secondary">
                                <Link href="/admin/size-guides/create">
                                    {t('sizeGuides.new')}
                                </Link>
                            </AdminButton>
                        }
                    />
                ) : (
                    <AdminDataTable>
                        <AdminDataTableHead>
                            <AdminDataTableHeaderRow>
                                <AdminDataTableHeaderCell>
                                    {t('sizeGuides.name')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {t('sizeGuides.appliesToColumn')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {t('sizeGuides.rowsCount')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell className="text-right">
                                    {tCommon('actions')}
                                </AdminDataTableHeaderCell>
                            </AdminDataTableHeaderRow>
                        </AdminDataTableHead>
                        <AdminDataTableBody>
                            {sizeGuides.data.map((sizeGuide) => (
                                <AdminDataTableRow key={sizeGuide.id}>
                                    <AdminDataTableCell className="font-medium text-[var(--admin-primary)]">
                                        {sizeGuide.name}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-admin-secondary">
                                        {sizeGuide.isDefault &&
                                        !sizeGuide.brandName &&
                                        !sizeGuide.categoryName ? (
                                            <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
                                                {t('sizeGuides.defaultBadge')}
                                            </span>
                                        ) : (
                                            appliesToLabel(
                                                sizeGuide,
                                                t('sizeGuides.defaultBadge'),
                                            )
                                        )}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell>
                                        {sizeGuide.rowsCount}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <AdminRowActionLink
                                                href={`/admin/size-guides/${sizeGuide.id}/edit`}
                                            >
                                                {tCommon('edit')}
                                            </AdminRowActionLink>
                                            <AdminRowActionLink
                                                variant="danger"
                                                onClick={() =>
                                                    setDeleteId(sizeGuide.id)
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
                title={t('sizeGuides.deleteConfirm')}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={destroy}
            />
        </>
    );
}
