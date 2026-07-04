import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { formatCurrency, formatDate, useLocale } from '@/hooks/use-locale';
import type { OrderDetail } from '@/types/order';

type OrderShowPageProps = {
    order: OrderDetail;
    seo: SeoData;
};

export default function OrderShowPage({ order, seo }: OrderShowPageProps) {
    const { t } = useTranslation(['storefront', 'common']);
    const { locale, currency } = useLocale();

    return (
        <>
            <PageSeo seo={seo} />

            <div className="storefront-container storefront-section">
                <Link
                    href="/orders"
                    className="text-caption-md text-mute hover:underline"
                >
                    {t('storefront:orders.backToOrders')}
                </Link>

                <h1 className="text-heading-xl mt-4 text-ink">
                    {t('storefront:orders.orderNumber', {
                        orderNumber: order.orderNumber,
                    })}
                </h1>
                <p className="text-caption-md mt-2 text-mute">
                    {t('storefront:orders.placed', {
                        date: order.createdAt
                            ? formatDate(order.createdAt, locale)
                            : t('common:emDash'),
                    })}
                </p>

                <div className="mt-8 grid gap-8 desktop:grid-cols-2">
                    <section className="border border-hairline p-6">
                        <h2 className="text-heading-lg text-ink">
                            {t('storefront:orders.shipping')}
                        </h2>
                        <dl className="text-body-strong mt-4 space-y-2">
                            <div>
                                <dt className="text-caption-md text-mute">
                                    {t('common:name')}
                                </dt>
                                <dd>{order.shippingAddress.name}</dd>
                            </div>
                            <div>
                                <dt className="text-caption-md text-mute">
                                    {t('common:phone')}
                                </dt>
                                <dd>{order.shippingAddress.phone}</dd>
                            </div>
                            <div>
                                <dt className="text-caption-md text-mute">
                                    {t('common:address')}
                                </dt>
                                <dd className="whitespace-pre-wrap">
                                    {order.shippingAddress.address}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    <section className="border border-hairline p-6">
                        <h2 className="text-heading-lg text-ink">
                            {t('storefront:orders.summary')}
                        </h2>
                        <dl className="text-body-strong mt-4 space-y-2">
                            <div className="flex justify-between">
                                <dt className="text-mute">
                                    {t('common:status')}
                                </dt>
                                <dd>
                                    {t(
                                        `storefront:orders.status.${order.status}`,
                                        { defaultValue: order.status },
                                    )}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-mute">
                                    {t('common:total')}
                                </dt>
                                <dd>
                                    {formatCurrency(
                                        order.totalAmount,
                                        locale,
                                        currency,
                                    )}
                                </dd>
                            </div>
                        </dl>
                    </section>
                </div>

                <section className="mt-8 border border-hairline">
                    <h2 className="text-heading-lg border-b border-hairline px-6 py-4 text-ink">
                        {t('storefront:orders.items')}
                    </h2>
                    <ul>
                        {order.items.map((item) => (
                            <li
                                key={item.id}
                                className="flex items-center justify-between gap-4 border-b border-hairline-soft px-6 py-4 last:border-b-0"
                            >
                                <div>
                                    <p className="text-body-strong text-ink">
                                        {item.productName}
                                    </p>
                                    <p className="text-caption-md text-mute">
                                        {(item.options ?? [])
                                            .map((option) => option.value)
                                            .join(' / ') ||
                                            `${item.colorName} / ${item.size}`}{' '}
                                        ×{' '}
                                        {item.quantity}
                                    </p>
                                </div>
                                <span className="text-body-strong text-ink">
                                    {formatCurrency(
                                        item.lineTotal,
                                        locale,
                                        currency,
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>

                <StorefrontButton variant="secondary" className="mt-8" asChild>
                    <Link href="/men">
                        {t('storefront:cart.continueShopping')}
                    </Link>
                </StorefrontButton>
            </div>
        </>
    );
}
