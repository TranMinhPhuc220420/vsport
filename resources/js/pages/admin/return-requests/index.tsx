import { Head, router, setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

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
import { AdminFilterTabs } from '@/components/admin/ui/admin-filter-tabs';
import { AdminPagination } from '@/components/admin/ui/admin-pagination';
import { AdminRowActionLink } from '@/components/admin/ui/admin-row-action-link';
import { useAdminFilterPending } from '@/hooks/use-admin-filter-pending';
import { formatDateTime, useLocale } from '@/hooks/use-locale';

type ReturnRequestRow = {
    id: number;
    status: string;
    reason: string;
    requestedAt: string | null;
    orderNumber?: string | null;
    customer?: { name: string; email: string } | null;
};

type AdminReturnRequestsIndexProps = {
    returnRequests: {
        data: ReturnRequestRow[];
        links: {
            first: string | null;
            last: string | null;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
    filters: { status: string | null };
    statusOptions: string[];
};

export default function AdminReturnRequestsIndex({
    returnRequests,
    filters,
    statusOptions,
}: AdminReturnRequestsIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { locale } = useLocale();
    const { onStart, onFinish } = useAdminFilterPending();

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.returnRequests'),
                href: '/admin/return-requests',
            },
        ],
    });

    const filterOptions = [
        { value: '', label: t('returnRequests.filterAll') },
        ...statusOptions.map((status) => ({
            value: status,
            label: t(`returnRequests.statuses.${status}`),
        })),
    ];

    const applyFilter = (status: string) => {
        onStart();
        router.get('/admin/return-requests', status ? { status } : {}, {
            preserveState: true,
            onFinish,
        });
    };

    const exportParams = new URLSearchParams();

    if (filters.status) {
        exportParams.set('status', filters.status);
    }

    const exportHref = `/admin/return-requests/export${
        exportParams.toString() ? `?${exportParams.toString()}` : ''
    }`;

    return (
        <>
            <Head title={t('returnRequests.title')} />

            <div className="admin-page">
                <AdminPageHeader
                    title={t('returnRequests.title')}
                    subtitle={t('returnRequests.description')}
                    actions={
                        <AdminButton asChild variant="secondary">
                            <a href={exportHref}>
                                {t('returnRequests.exportCsv')}
                            </a>
                        </AdminButton>
                    }
                />

                <AdminFilterTabs
                    value={filters.status ?? ''}
                    options={filterOptions}
                    onChange={applyFilter}
                    className="mt-6"
                />

                {returnRequests.data.length === 0 ? (
                    <AdminEmptyState
                        className="mt-8"
                        title={t('returnRequests.emptyTitle')}
                        description={t('returnRequests.emptyDescription')}
                    />
                ) : (
                    <AdminDataTable className="mt-6">
                        <AdminDataTableHead>
                            <AdminDataTableHeaderRow>
                                <AdminDataTableHeaderCell>
                                    {t('returnRequests.order')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {t('returnRequests.customer')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {tCommon('status')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {t('returnRequests.requested')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell />
                            </AdminDataTableHeaderRow>
                        </AdminDataTableHead>
                        <AdminDataTableBody>
                            {returnRequests.data.map((row) => (
                                <AdminDataTableRow key={row.id}>
                                    <AdminDataTableCell>
                                        {row.orderNumber ?? tCommon('emDash')}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell>
                                        <div>
                                            <p>{row.customer?.name}</p>
                                            <p className="admin-caption text-admin-secondary">
                                                {row.customer?.email}
                                            </p>
                                        </div>
                                    </AdminDataTableCell>
                                    <AdminDataTableCell>
                                        {t(
                                            `returnRequests.statuses.${row.status}`,
                                        )}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell>
                                        {row.requestedAt
                                            ? formatDateTime(
                                                  row.requestedAt,
                                                  locale,
                                              )
                                            : tCommon('emDash')}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-right">
                                        <AdminRowActionLink
                                            href={`/admin/return-requests/${row.id}`}
                                        >
                                            {tCommon('edit')}
                                        </AdminRowActionLink>
                                    </AdminDataTableCell>
                                </AdminDataTableRow>
                            ))}
                        </AdminDataTableBody>
                    </AdminDataTable>
                )}

                <AdminPagination
                    className="mt-6"
                    links={returnRequests.links}
                    meta={returnRequests.meta}
                />
            </div>
        </>
    );
}
