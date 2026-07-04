import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminCard } from '@/components/admin/ui/admin-card';
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
import type { AdminStatCardTrend } from '@/components/admin/ui/admin-stat-card';
import { AdminStatCard } from '@/components/admin/ui/admin-stat-card';
import { formatCurrency, useLocale } from '@/hooks/use-locale';
import type { OrderDetail } from '@/types/order';

type PeriodTrend = {
    direction: 'up' | 'down' | 'flat';
    percent: number | null;
};

type AdminDashboardProps = {
    stats: {
        pendingOrdersCount: number;
        revenueTotal: number;
        productCount: number;
        pendingReviewsCount: number;
        periodRevenueTotal: number;
        periodRevenueTrend: PeriodTrend;
        periodOrdersCount: number;
        periodOrdersTrend: PeriodTrend;
        averageOrderValue: number;
        averageOrderValueTrend: PeriodTrend;
    };
    ordersByStatus: Record<string, number>;
    lowStockProducts: {
        name: string;
        slug: string;
        totalStock: number;
    }[];
    recentOrders: { data: OrderDetail[] };
};

const pipelineStatuses = [
    'pending',
    'confirmed',
    'shipping',
    'delivered',
    'completed',
] as const;

function orderStatusKey(status: string): string {
    return `orders.status.${status}`;
}

function toStatCardTrend(
    trend: PeriodTrend,
    t: (key: string) => string,
): AdminStatCardTrend {
    const value =
        trend.percent === null
            ? t('dashboard.newActivity')
            : `${trend.percent > 0 ? '+' : ''}${trend.percent}%`;

    return { direction: trend.direction, value };
}

export default function AdminDashboard({
    stats,
    ordersByStatus,
    lowStockProducts,
    recentOrders,
}: AdminDashboardProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { locale, currency } = useLocale();

    setLayoutProps({
        breadcrumbs: [{ title: t('dashboard.title'), href: '/admin' }],
    });

    return (
        <>
            <Head title={t('dashboard.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('dashboard.title')}
                    subtitle={t('dashboard.description')}
                />

                <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
                    <Link href="/admin/orders?status=pending" className="block">
                        <AdminStatCard
                            label={t('dashboard.pendingOrders')}
                            value={stats.pendingOrdersCount}
                            className="h-full transition-colors hover:border-[var(--admin-border-strong)]"
                        />
                    </Link>
                    <AdminStatCard
                        label={t('dashboard.revenue')}
                        value={formatCurrency(
                            stats.revenueTotal,
                            locale,
                            currency,
                        )}
                        trend={toStatCardTrend(stats.periodRevenueTrend, t)}
                    />
                    <AdminStatCard
                        label={t('dashboard.ordersPlaced')}
                        value={stats.periodOrdersCount}
                        trend={toStatCardTrend(stats.periodOrdersTrend, t)}
                    />
                    <AdminStatCard
                        label={t('dashboard.averageOrderValue')}
                        value={formatCurrency(
                            stats.averageOrderValue,
                            locale,
                            currency,
                        )}
                        trend={toStatCardTrend(stats.averageOrderValueTrend, t)}
                    />
                    <Link href="/admin/products" className="block">
                        <AdminStatCard
                            label={t('dashboard.products')}
                            value={stats.productCount}
                            className="h-full transition-colors hover:border-[var(--admin-border-strong)]"
                        />
                    </Link>
                    <Link href="/admin/reviews" className="block">
                        <AdminStatCard
                            label={t('dashboard.pendingReviews')}
                            value={stats.pendingReviewsCount}
                            className="h-full transition-colors hover:border-[var(--admin-border-strong)]"
                        />
                    </Link>
                </div>

                <p className="admin-caption text-admin-secondary -mt-2">
                    {t('dashboard.vsLastPeriod')}
                </p>

                <div className="grid gap-4 lg:grid-cols-2">
                    <AdminCard>
                        <h2 className="admin-section-title">
                            {t('dashboard.orderPipeline')}
                        </h2>
                        <div className="mt-4 flex flex-wrap gap-3">
                            {pipelineStatuses.map((status) => (
                                <Link
                                    key={status}
                                    href={`/admin/orders?status=${status}`}
                                    className="border-admin rounded-admin-md flex min-w-[120px] flex-col border bg-[var(--admin-neutral)] px-4 py-3 transition-colors hover:bg-[var(--admin-surface)]"
                                >
                                    <span className="admin-caption text-admin-secondary">
                                        {t(orderStatusKey(status), {
                                            defaultValue: status,
                                        })}
                                    </span>
                                    <span className="mt-1 text-lg font-semibold text-[var(--admin-primary)]">
                                        {ordersByStatus[status] ?? 0}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </AdminCard>

                    {lowStockProducts.length > 0 && (
                        <AdminCard>
                            <h2 className="admin-section-title">
                                {t('dashboard.lowStock')}
                            </h2>
                            <ul className="mt-4 space-y-2">
                                {lowStockProducts.map((product) => (
                                    <li key={product.slug}>
                                        <Link
                                            href={`/admin/products/${product.slug}/edit?tab=inventory`}
                                            className="admin-body-strong hover:underline"
                                        >
                                            {product.name}
                                        </Link>
                                        <span className="admin-caption text-admin-secondary ml-2">
                                            ({product.totalStock})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </AdminCard>
                    )}
                </div>

                <section>
                    <h2 className="admin-section-title">
                        {t('dashboard.recentOrders')}
                    </h2>
                    <div className="mt-4">
                        <div className="hidden md:block">
                            <AdminDataTable minWidth="640px">
                                <AdminDataTableHead>
                                    <AdminDataTableHeaderRow>
                                        <AdminDataTableHeaderCell>
                                            {t('dashboard.order')}
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
                                    {recentOrders.data.map((order) => (
                                        <AdminDataTableRow key={order.id}>
                                            <AdminDataTableCell>
                                                <Link
                                                    href={`/admin/orders/${order.orderNumber}`}
                                                    className="admin-body-strong font-medium hover:underline"
                                                >
                                                    {order.orderNumber}
                                                </Link>
                                            </AdminDataTableCell>
                                            <AdminDataTableCell>
                                                {t(
                                                    orderStatusKey(
                                                        order.status,
                                                    ),
                                                    {
                                                        defaultValue:
                                                            order.status,
                                                    },
                                                )}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell
                                                align="right"
                                                className="font-medium"
                                            >
                                                {formatCurrency(
                                                    order.totalAmount,
                                                    locale,
                                                    currency,
                                                )}
                                            </AdminDataTableCell>
                                        </AdminDataTableRow>
                                    ))}
                                </AdminDataTableBody>
                            </AdminDataTable>
                        </div>

                        <AdminCardList className="md:hidden">
                            {recentOrders.data.map((order) => (
                                <AdminCardListItem
                                    key={order.id}
                                    title={order.orderNumber}
                                    badge={
                                        <span className="admin-caption text-admin-secondary">
                                            {t(orderStatusKey(order.status), {
                                                defaultValue: order.status,
                                            })}
                                        </span>
                                    }
                                    onClick={() =>
                                        router.visit(
                                            `/admin/orders/${order.orderNumber}`,
                                        )
                                    }
                                >
                                    <AdminCardListField
                                        label={tCommon('total')}
                                    >
                                        {formatCurrency(
                                            order.totalAmount,
                                            locale,
                                            currency,
                                        )}
                                    </AdminCardListField>
                                </AdminCardListItem>
                            ))}
                        </AdminCardList>
                    </div>
                </section>
            </div>
        </>
    );
}
