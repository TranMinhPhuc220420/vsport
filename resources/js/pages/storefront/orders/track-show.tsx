import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { OrderTrackingPanel } from '@/components/storefront/order-tracking-panel';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { formatDate, useLocale } from '@/hooks/use-locale';
import type { OrderDetail } from '@/types/order';

type OrderTrackShowPageProps = {
    order: OrderDetail;
    seo: SeoData;
};

export default function OrderTrackShowPage({
    order,
    seo,
}: OrderTrackShowPageProps) {
    const { t } = useTranslation(['storefront', 'common']);
    const { locale } = useLocale();

    return (
        <>
            <PageSeo seo={seo} />

            <div className="storefront-container storefront-section max-w-2xl">
                <Link
                    href="/orders/track"
                    className="text-caption-md text-mute hover:underline"
                >
                    {t('storefront:orders.tracking.backToLookup')}
                </Link>

                <h1 className="text-heading-xl mt-4 text-ink">
                    {t('storefront:orders.tracking.detailTitle')}
                </h1>
                <p className="text-caption-md mt-2 text-mute">
                    {t('storefront:orders.orderNumber', {
                        orderNumber: order.orderNumber,
                    })}
                    {' · '}
                    {t('storefront:orders.placed', {
                        date: order.createdAt
                            ? formatDate(order.createdAt, locale)
                            : t('common:emDash'),
                    })}
                </p>

                <div className="mt-8 space-y-6">
                    <section className="border border-hairline p-6">
                        <h2 className="text-heading-lg text-ink">
                            {t('common:status')}
                        </h2>
                        <p className="text-body-strong mt-4 text-ink">
                            {t(`storefront:orders.status.${order.status}`, {
                                defaultValue: order.status,
                            })}
                        </p>
                    </section>

                    <OrderTrackingPanel order={order} />
                </div>
            </div>
        </>
    );
}
