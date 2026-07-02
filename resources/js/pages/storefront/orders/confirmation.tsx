import { Head, Link } from '@inertiajs/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { useCart } from '@/contexts/cart-context';
import { formatCurrency, useLocale } from '@/hooks/use-locale';
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

    return (
        <>
            <Head title={t('storefront:orders.confirmed')} />

            <div className="storefront-container storefront-section">
                <h1 className="text-heading-xl text-ink">
                    {t('storefront:orders.thankYou')}
                </h1>
                <p className="mt-2 text-body-strong text-mute">
                    {t('storefront:orders.confirmDesc')}
                </p>

                <div className="mt-8 max-w-xl border border-hairline p-6">
                    <p className="text-caption-md text-mute">
                        {t('storefront:orders.orderNumberLabel')}
                    </p>
                    <p className="text-heading-lg text-ink">{order.orderNumber}</p>

                    <dl className="mt-6 space-y-3 text-body-strong">
                        <div className="flex justify-between">
                            <dt className="text-mute">{t('common:status')}</dt>
                            <dd className="text-ink">
                                {t(
                                    `storefront:orders.status.${order.status}`,
                                    { defaultValue: order.status },
                                )}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-mute">{t('common:total')}</dt>
                            <dd className="text-ink">
                                {formatCurrency(order.totalAmount, locale)}
                            </dd>
                        </div>
                    </dl>

                    <ul className="mt-6 space-y-3 border-t border-hairline pt-6">
                        {order.items.map((item) => (
                            <li
                                key={item.id}
                                className="flex justify-between text-caption-md"
                            >
                                <span className="text-mute">
                                    {item.productName} ({item.colorName},{' '}
                                    {item.size}) × {item.quantity}
                                </span>
                                <span className="text-ink">
                                    {formatCurrency(item.lineTotal, locale)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
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
