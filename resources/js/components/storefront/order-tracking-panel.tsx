import { useTranslation } from 'react-i18next';

import type { OrderDetail } from '@/types/order';

type OrderTrackingPanelProps = {
    order: Pick<
        OrderDetail,
        'status' | 'trackingNumber' | 'shippingCarrier' | 'trackingUrl'
    >;
};

export function OrderTrackingPanel({ order }: OrderTrackingPanelProps) {
    const { t } = useTranslation('storefront');

    const hasTracking = Boolean(order.trackingNumber);

    return (
        <section className="border border-hairline p-6">
            <h2 className="text-heading-lg text-ink">
                {t('orders.tracking.title')}
            </h2>

            {!hasTracking ? (
                <p className="text-caption-md mt-4 text-mute">
                    {order.status === 'shipping' ||
                    order.status === 'delivered' ||
                    order.status === 'completed'
                        ? t('orders.tracking.pending')
                        : t('orders.tracking.notShipped')}
                </p>
            ) : (
                <dl className="text-body-strong mt-4 space-y-3">
                    {order.shippingCarrier ? (
                        <div>
                            <dt className="text-caption-md text-mute">
                                {t('orders.tracking.carrier')}
                            </dt>
                            <dd>
                                {t(
                                    `orders.tracking.carriers.${order.shippingCarrier}`,
                                    {
                                        defaultValue: order.shippingCarrier,
                                    },
                                )}
                            </dd>
                        </div>
                    ) : null}
                    <div>
                        <dt className="text-caption-md text-mute">
                            {t('orders.tracking.number')}
                        </dt>
                        <dd>{order.trackingNumber}</dd>
                    </div>
                    {order.trackingUrl ? (
                        <div>
                            <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-caption-md underline underline-offset-4"
                            >
                                {t('orders.tracking.trackExternal')}
                            </a>
                        </div>
                    ) : null}
                </dl>
            )}
        </section>
    );
}
