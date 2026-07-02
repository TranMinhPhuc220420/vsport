import { Head, setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

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
import { AdminStatCard } from '@/components/admin/ui/admin-stat-card';
import { formatCurrency, formatDate, useLocale } from '@/hooks/use-locale';

type RevenueByDayRow = {
    date: string;
    revenue: number;
};

type TopProductRow = {
    name: string;
    revenue: number;
    quantity: number;
};

type AdminAnalyticsIndexProps = {
    revenueByDay: RevenueByDayRow[];
    topProducts: TopProductRow[];
    averageOrderValue: number;
};

export default function AdminAnalyticsIndex({
    revenueByDay,
    topProducts,
    averageOrderValue,
}: AdminAnalyticsIndexProps) {
    const { t } = useTranslation('admin');
    const { locale } = useLocale();

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.analytics'), href: '/admin/analytics' },
        ],
    });

    const chartData = revenueByDay.map((row) => ({
        date: formatDate(row.date, locale),
        revenue: row.revenue,
    }));

    return (
        <>
            <Head title={t('analytics.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('analytics.title')}
                    subtitle={t('analytics.description')}
                />

                <AdminStatCard
                    label={t('analytics.avgOrder')}
                    value={formatCurrency(averageOrderValue, locale)}
                />

                <section className="space-y-4">
                    <h2 className="admin-section-title">
                        {t('analytics.revenueByDay')}
                    </h2>
                    {chartData.length === 0 ? (
                        <p className="text-admin-secondary text-sm">
                            {t('analytics.noRevenue')}
                        </p>
                    ) : (
                        <div className="border-admin rounded-lg border bg-[var(--admin-surface)] p-4 shadow-sm">
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value) =>
                                                formatCurrency(
                                                    Number(value ?? 0),
                                                    locale,
                                                )
                                            }
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#0A2540"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </section>

                <section className="space-y-4">
                    <h2 className="admin-section-title">
                        {t('analytics.topProducts')}
                    </h2>
                    <AdminDataTable>
                        <AdminDataTableHead>
                            <AdminDataTableHeaderRow>
                                <AdminDataTableHeaderCell>
                                    {t('reviews.product')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell className="text-right">
                                    {t('analytics.quantity')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell className="text-right">
                                    {t('analytics.revenue')}
                                </AdminDataTableHeaderCell>
                            </AdminDataTableHeaderRow>
                        </AdminDataTableHead>
                        <AdminDataTableBody>
                            {topProducts.length === 0 ? (
                                <AdminDataTableRow>
                                    <AdminDataTableCell
                                        colSpan={3}
                                        className="text-admin-secondary py-8 text-center"
                                    >
                                        {t('analytics.noProductSales')}
                                    </AdminDataTableCell>
                                </AdminDataTableRow>
                            ) : (
                                topProducts.map((product) => (
                                    <AdminDataTableRow key={product.name}>
                                        <AdminDataTableCell className="font-medium text-[var(--admin-primary)]">
                                            {product.name}
                                        </AdminDataTableCell>
                                        <AdminDataTableCell className="text-admin-secondary text-right">
                                            {product.quantity}
                                        </AdminDataTableCell>
                                        <AdminDataTableCell className="text-right font-medium text-[var(--admin-primary)]">
                                            {formatCurrency(
                                                product.revenue,
                                                locale,
                                            )}
                                        </AdminDataTableCell>
                                    </AdminDataTableRow>
                                ))
                            )}
                        </AdminDataTableBody>
                    </AdminDataTable>
                </section>
            </div>
        </>
    );
}
