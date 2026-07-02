import { Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { formatCurrency, useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

type CartSummaryProps = {
    subtotal: number;
    itemCount: number;
    className?: string;
};

function CartSummary({ subtotal, itemCount, className }: CartSummaryProps) {
    const { t } = useTranslation('storefront');
    const { locale } = useLocale();
    const { auth } = usePage().props as {
        auth: { user: { id: number } | null };
    };

    const handleCheckout = () => {
        if (!auth.user) {
            router.visit('/login');

            return;
        }

        router.visit('/checkout');
    };

    return (
        <aside
            data-slot="cart-summary"
            className={cn(
                'border border-hairline p-6 desktop:sticky desktop:top-24',
                className,
            )}
        >
            <h2 className="text-heading-lg text-ink">{t('cart.summary')}</h2>
            <dl className="mt-4 space-y-3">
                <div className="flex justify-between text-body-strong">
                    <dt className="text-mute">
                        {t('cart.subtotalWithCount', { count: itemCount })}
                    </dt>
                    <dd className="text-ink">
                        {formatCurrency(subtotal, locale)}
                    </dd>
                </div>
                <div className="flex justify-between border-t border-hairline pt-3 text-body-strong">
                    <dt className="text-ink">{t('cart.estimatedTotal')}</dt>
                    <dd className="text-ink">
                        {formatCurrency(subtotal, locale)}
                    </dd>
                </div>
            </dl>
            <p className="mt-3 text-caption-md text-mute">{t('cart.codNote')}</p>
            <StorefrontButton
                variant="primary"
                className="mt-6 w-full"
                onClick={handleCheckout}
                disabled={itemCount === 0}
            >
                {t('cart.checkout')}
            </StorefrontButton>
            {!auth.user && itemCount > 0 && (
                <p className="mt-3 text-caption-md text-mute">
                    <Link href="/login" className="text-ink underline">
                        {t('cart.signInToComplete')}
                    </Link>{' '}
                    {t('cart.signInSuffix')}
                </p>
            )}
        </aside>
    );
}

export { CartSummary };
