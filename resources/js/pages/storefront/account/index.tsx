import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { formatCurrency, formatDate, useLocale } from '@/hooks/use-locale';
import { logout } from '@/routes';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';
import type { User } from '@/types/auth';
import type { OrderDetail } from '@/types/order';

type AccountPageProps = {
    recentOrders: OrderDetail[];
    seo: SeoData;
};

export default function AccountPage({ recentOrders, seo }: AccountPageProps) {
    const { t } = useTranslation('storefront');
    const { t: tCommon } = useTranslation('common');
    const { locale, currency } = useLocale();
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const user = auth.user;

    const handleLogout = () => {
        router.post(logout().url);
    };

    return (
        <>
            <PageSeo seo={seo} />

            <div className="storefront-container storefront-section">
                <h1 className="text-heading-xl text-ink">
                    {t('account.greeting', { name: user.name })}
                </h1>
                <p className="text-caption-md mt-2 text-mute">{user.email}</p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <StorefrontButton variant="primary" asChild>
                        <Link href="/orders">{t('nav.orders')}</Link>
                    </StorefrontButton>
                    <StorefrontButton variant="secondary" asChild>
                        <Link href={profileEdit()}>
                            {t('account.settings')}
                        </Link>
                    </StorefrontButton>
                    <StorefrontButton variant="secondary" asChild>
                        <Link href={securityEdit()}>
                            {t('settings.nav.security')}
                        </Link>
                    </StorefrontButton>
                    <StorefrontButton variant="secondary" asChild>
                        <Link href="/wishlist">{t('nav.wishlist')}</Link>
                    </StorefrontButton>
                </div>

                <section className="mt-12">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-heading-lg text-ink">
                            {t('account.recentOrders')}
                        </h2>
                        {recentOrders.length > 0 && (
                            <Link
                                href="/orders"
                                className="text-caption-md text-mute hover:text-ink hover:underline"
                            >
                                {t('account.viewAllOrders')}
                            </Link>
                        )}
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-body-strong mt-4 text-mute">
                            {t('orders.empty')}
                        </p>
                    ) : (
                        <ul className="mt-4 divide-y divide-hairline border border-hairline">
                            {recentOrders.map((order) => (
                                <li key={order.id}>
                                    <Link
                                        href={`/orders/${order.orderNumber}`}
                                        className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-soft-cloud"
                                    >
                                        <div>
                                            <p className="text-body-strong text-ink">
                                                {t('orders.orderNumber', {
                                                    orderNumber:
                                                        order.orderNumber,
                                                })}
                                            </p>
                                            <p className="text-caption-md text-mute">
                                                {order.createdAt
                                                    ? formatDate(
                                                          order.createdAt,
                                                          locale,
                                                      )
                                                    : tCommon('emDash')}
                                                {' · '}
                                                {t(
                                                    `orders.status.${order.status}`,
                                                    {
                                                        defaultValue:
                                                            order.status,
                                                    },
                                                )}
                                            </p>
                                        </div>
                                        <span className="text-body-strong text-ink">
                                            {formatCurrency(
                                                order.totalAmount,
                                                locale,
                                                currency,
                                            )}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <StorefrontButton
                    type="button"
                    variant="secondary"
                    className="mt-10"
                    onClick={handleLogout}
                >
                    {tCommon('logOut')}
                </StorefrontButton>
            </div>
        </>
    );
}
