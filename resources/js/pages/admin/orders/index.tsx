import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { adminInputClassName } from '@/components/admin/admin-form';
import {
    AdminDataTable,
    AdminDataTableBody,
    AdminDataTableCell,
    AdminDataTableHead,
    AdminDataTableHeaderCell,
    AdminDataTableHeaderRow,
    AdminDataTableRow,
} from '@/components/admin/ui/admin-data-table';
import { AdminFilterTabs } from '@/components/admin/ui/admin-filter-tabs';
import { AdminPagination } from '@/components/admin/ui/admin-pagination';
import {
    formatCurrency,
    formatDateTime,
    useLocale,
} from '@/hooks/use-locale';
import type { PaginatedOrders } from '@/types/order';

type AdminOrdersPageProps = {
    orders: PaginatedOrders;
    filters: { status: string | null; search: string | null };
    statusOptions: string[];
};

function orderStatusKey(status: string): string {
    return `orders.status.${status}`;
}

export default function AdminOrdersIndex({
    orders,
    filters,
    statusOptions,
}: AdminOrdersPageProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { locale } = useLocale();

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.orders'), href: '/admin/orders' },
        ],
    });

    const filterOptions = [
        { value: null, label: tCommon('all') },
        ...statusOptions.map((status) => ({
            value: status,
            label: t(orderStatusKey(status), { defaultValue: status }),
        })),
    ];

    const applyStatus = (status: string | null) => {
        router.get(
            '/admin/orders',
            {
                status: status ?? undefined,
                search: filters.search ?? undefined,
            },
            { preserveState: true },
        );
    };

    const applySearch = (search: string) => {
        router.get(
            '/admin/orders',
            {
                search: search || undefined,
                status: filters.status ?? undefined,
            },
            { preserveState: true },
        );
    };

    const formatOrderDate = (value: string | null): string => {
        if (!value) {
            return tCommon('emDash');
        }

        return formatDateTime(value, locale, {
            dateStyle: 'medium',
            timeStyle: 'short',
        });
    };

    const exportParams = new URLSearchParams();

    if (filters.status) {
        exportParams.set('status', filters.status);
    }

    if (filters.search) {
        exportParams.set('search', filters.search);
    }

    const exportHref = `/admin/orders/export${
        exportParams.toString() ? `?${exportParams.toString()}` : ''
    }`;

    return (
        <>
            <Head title={t('orders.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('orders.title')}
                    subtitle={t('orders.description')}
                    actions={
                        <AdminButton asChild variant="secondary">
                            <a href={exportHref}>{t('orders.exportCsv')}</a>
                        </AdminButton>
                    }
                />

                <AdminFilterTabs
                    value={filters.status}
                    onChange={applyStatus}
                    options={filterOptions}
                />

                <div className="max-w-96">
                    <label className="admin-label">{t('orders.search')}</label>
                    <input
                        className={adminInputClassName}
                        defaultValue={filters.search ?? ''}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                applySearch(event.currentTarget.value);
                            }
                        }}
                        onBlur={(event) => applySearch(event.target.value)}
                    />
                </div>

                <AdminDataTable minWidth="720px">
                    <AdminDataTableHead>
                        <AdminDataTableHeaderRow>
                            <AdminDataTableHeaderCell>
                                {t('dashboard.order')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('orders.customer')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {tCommon('date')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {tCommon('status')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell align="right">
                                {tCommon('total')}
                            </AdminDataTableHeaderCell>
                        </AdminDataTableHeaderRow>
                    </AdminDataTableHead>
                    <AdminDataTableBody>
                        {orders.data.map((order) => (
                            <AdminDataTableRow key={order.id}>
                                <AdminDataTableCell>
                                    <Link
                                        href={`/admin/orders/${order.orderNumber}`}
                                        className="admin-body-strong font-medium text-[var(--admin-primary)] hover:underline"
                                    >
                                        {order.orderNumber}
                                    </Link>
                                </AdminDataTableCell>
                                <AdminDataTableCell className="text-admin-secondary">
                                    {'customer' in order &&
                                    order.customer &&
                                    typeof order.customer === 'object'
                                        ? (order.customer as { email: string })
                                              .email
                                        : tCommon('emDash')}
                                </AdminDataTableCell>
                                <AdminDataTableCell className="text-admin-secondary">
                                    {formatOrderDate(order.createdAt)}
                                </AdminDataTableCell>
                                <AdminDataTableCell>
                                    {t(orderStatusKey(order.status), {
                                        defaultValue: order.status,
                                    })}
                                </AdminDataTableCell>
                                <AdminDataTableCell
                                    align="right"
                                    className="font-medium"
                                >
                                    {formatCurrency(order.totalAmount, locale)}
                                </AdminDataTableCell>
                            </AdminDataTableRow>
                        ))}
                    </AdminDataTableBody>
                </AdminDataTable>

                <AdminPagination
                    links={orders.links}
                    meta={{
                        current_page: orders.meta.current_page,
                        from: null,
                        last_page: orders.meta.last_page,
                        per_page: 15,
                        to: null,
                        total: orders.meta.total,
                    }}
                />
            </div>
        </>
    );
}
