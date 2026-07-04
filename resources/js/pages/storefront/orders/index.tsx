import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { StorefrontPagination } from '@/components/storefront/pagination';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { formatCurrency, formatDate, useLocale } from '@/hooks/use-locale';
import type { PaginatedOrders } from '@/types/order';

type OrderHistoryPageProps = {
    orders: PaginatedOrders;
    seo: SeoData;
};

export default function OrderHistoryPage({ orders, seo }: OrderHistoryPageProps) {
    const { t } = useTranslation(['storefront', 'common']);
    const { locale, currency } = useLocale();

    return (
        <>
            <PageSeo seo={seo} />

            <div className="storefront-container storefront-section">
                <h1 className="text-heading-xl text-ink">
                    {t('storefront:orders.title')}
                </h1>

                {orders.data.length === 0 ? (
                    <p className="text-body-strong mt-6 text-mute">
                        {t('storefront:orders.empty')}
                    </p>
                ) : (
                    <div className="mt-8 overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left">
                            <thead>
                                <tr className="text-caption-md border-b border-hairline text-mute">
                                    <th className="py-3 pr-4">
                                        {t('storefront:orders.order')}
                                    </th>
                                    <th className="py-3 pr-4">
                                        {t('common:date')}
                                    </th>
                                    <th className="py-3 pr-4">
                                        {t('common:status')}
                                    </th>
                                    <th className="py-3 text-right">
                                        {t('common:total')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.data.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-hairline-soft"
                                    >
                                        <td className="py-4 pr-4">
                                            <Link
                                                href={`/orders/${order.orderNumber}`}
                                                className="text-body-strong text-ink hover:underline"
                                            >
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td className="text-caption-md py-4 pr-4 text-mute">
                                            {order.createdAt
                                                ? formatDate(
                                                      order.createdAt,
                                                      locale,
                                                  )
                                                : t('common:emDash')}
                                        </td>
                                        <td className="text-caption-md py-4 pr-4 text-ink">
                                            {t(
                                                `storefront:orders.status.${order.status}`,
                                                { defaultValue: order.status },
                                            )}
                                        </td>
                                        <td className="text-body-strong py-4 text-right text-ink">
                                            {formatCurrency(
                                                order.totalAmount,
                                                locale,
                                                currency,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <StorefrontPagination
                            links={orders.links}
                            meta={{
                                current_page: orders.meta.current_page,
                                from: null,
                                last_page: orders.meta.last_page,
                                per_page: 10,
                                to: null,
                                total: orders.meta.total,
                            }}
                        />
                    </div>
                )}
            </div>
        </>
    );
}
