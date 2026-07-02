import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { useCart } from '@/contexts/cart-context';
import { formatCurrency, formatDate, useLocale } from '@/hooks/use-locale';
import type { OrderDetail } from '@/types/order';

type OrderConfirmationPageProps = {
    order: OrderDetail;
};

export default function OrderConfirmationPage({
    order,
}: OrderConfirmationPageProps) {
    const { t } = useTranslation(['storefront', 'common']);
    const { locale } = useLocale();
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    const itemCount = order.items.reduce(
        (total, item) => total + item.quantity,
        0,
    );
    const hasDiscount = (order.discountAmount ?? 0) > 0;
    const paymentLabel =
        order.paymentMethod === 'cod'
            ? t('storefront:checkout.cod')
            : t('storefront:checkout.card');

    return (
        <>
            <Head title={t('storefront:orders.confirmed')} />

            <div className="storefront-container storefront-section">
                <ScrollReveal>
                    <div className="flex flex-col items-center text-center">
                        <span className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
                            <CheckCircle2 className="size-9" strokeWidth={1.5} />
                        </span>
                        <h1 className="text-heading-xl mt-6 text-ink">
                            {t('storefront:orders.confirmed')}
                        </h1>
                        <p className="text-body-strong mt-2 max-w-96 text-mute">
                            {t('storefront:orders.confirmDesc')}
                        </p>
                        <div className="text-caption-md mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                            <span className="text-mute">
                                {t('storefront:orders.orderNumberLabel')}:
                            </span>
                            <span className="text-body-strong text-ink">
                                {order.orderNumber}
                            </span>
                            {order.createdAt ? (
                                <span className="text-mute">
                                    · {formatDate(order.createdAt, locale)}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </ScrollReveal>

                <ScrollReveal
                    className="mx-auto mt-10 grid max-w-5xl gap-6 desktop:grid-cols-[1.4fr_1fr] desktop:items-start"
                    staggerChildren
                >
                    <section className="border border-hairline">
                        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
                            <h2 className="text-heading-md text-ink">
                                {t('storefront:orders.items')}
                            </h2>
                            <span className="text-caption-md text-mute">
                                {t('common:item', { count: itemCount })}
                            </span>
                        </div>
                        <ul>
                            {order.items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-start justify-between gap-4 border-b border-hairline-soft px-6 py-4 last:border-b-0"
                                >
                                    <div className="min-w-0">
                                        <p className="text-body-strong text-ink">
                                            {item.productName}
                                        </p>
                                        <p className="text-caption-md mt-1 text-mute">
                                            {item.colorName} / {item.size} ×{' '}
                                            {item.quantity}
                                        </p>
                                    </div>
                                    <span className="text-body-strong shrink-0 text-ink">
                                        {formatCurrency(item.lineTotal, locale)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <div className="flex flex-col gap-6">
                        <section className="border border-hairline p-6">
                            <h2 className="text-heading-md text-ink">
                                {t('storefront:orders.summary')}
                            </h2>
                            <dl className="mt-4 space-y-3">
                                {order.subtotalAmount !== undefined ? (
                                    <div className="text-caption-md flex justify-between">
                                        <dt className="text-mute">
                                            {t('storefront:cart.subtotal')}
                                        </dt>
                                        <dd className="text-ink">
                                            {formatCurrency(
                                                order.subtotalAmount,
                                                locale,
                                            )}
                                        </dd>
                                    </div>
                                ) : null}
                                {hasDiscount ? (
                                    <div className="text-caption-md flex justify-between">
                                        <dt className="text-mute">
                                            {t('storefront:checkout.discount')}
                                            {order.discountCode
                                                ? ` (${order.discountCode})`
                                                : ''}
                                        </dt>
                                        <dd className="text-sale">
                                            −
                                            {formatCurrency(
                                                order.discountAmount ?? 0,
                                                locale,
                                            )}
                                        </dd>
                                    </div>
                                ) : null}
                                <div className="flex justify-between border-t border-hairline pt-3">
                                    <dt className="text-body-strong text-ink">
                                        {t('common:total')}
                                    </dt>
                                    <dd className="text-body-strong text-ink">
                                        {formatCurrency(
                                            order.totalAmount,
                                            locale,
                                        )}
                                    </dd>
                                </div>
                                <div className="text-caption-md flex justify-between">
                                    <dt className="text-mute">
                                        {t('storefront:checkout.paymentMethod')}
                                    </dt>
                                    <dd className="text-ink">{paymentLabel}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className="border border-hairline p-6">
                            <h2 className="text-heading-md text-ink">
                                {t('storefront:orders.shipping')}
                            </h2>
                            <address className="text-caption-md mt-4 space-y-1 not-italic text-mute">
                                <p className="text-body-strong text-ink">
                                    {order.shippingAddress.name}
                                </p>
                                {order.shippingAddress.phone ? (
                                    <p>{order.shippingAddress.phone}</p>
                                ) : null}
                                <p className="whitespace-pre-wrap">
                                    {order.shippingAddress.address}
                                </p>
                            </address>
                        </section>
                    </div>
                </ScrollReveal>

                <div className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-4">
                    <StorefrontButton variant="primary" asChild>
                        <Link href="/orders">
                            {t('storefront:orders.viewOrders')}
                        </Link>
                    </StorefrontButton>
                    <StorefrontButton variant="secondary" asChild>
                        <Link href="/men">
                            {t('storefront:cart.continueShopping')}
                        </Link>
                    </StorefrontButton>
                </div>
            </div>
        </>
    );
}
