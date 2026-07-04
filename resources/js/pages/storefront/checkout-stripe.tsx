import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { formatCurrency, useLocale } from '@/hooks/use-locale';

type CheckoutStripePageProps = {
    orderNumber: string;
    clientSecret: string;
    stripeKey?: string | null;
    total: number;
    seo: SeoData;
};

export default function CheckoutStripePage({
    orderNumber,
    clientSecret,
    stripeKey,
    total,
    seo,
}: CheckoutStripePageProps) {
    const { t } = useTranslation('storefront');
    const { locale } = useLocale();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!stripeKey || !clientSecret) {
            return;
        }

        let mounted = true;

        void (async () => {
            const { loadStripe } = await import('@stripe/stripe-js');
            const stripe = await loadStripe(stripeKey);

            if (!stripe || !mounted) {
                return;
            }

            const elements = stripe.elements({ clientSecret });
            const paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');

            const form = document.getElementById('stripe-payment-form');

            form?.addEventListener('submit', async (event) => {
                event.preventDefault();
                setProcessing(true);
                setError(null);

                const { error: stripeError } = await stripe.confirmPayment({
                    elements,
                    confirmParams: {
                        return_url: `${window.location.origin}/orders/confirmation/${orderNumber}`,
                    },
                });

                if (stripeError) {
                    setError(stripeError.message ?? t('stripe.paymentFailed'));
                    setProcessing(false);
                }
            });
        })();

        return () => {
            mounted = false;
        };
    }, [clientSecret, orderNumber, stripeKey, t]);

    return (
        <>
            <PageSeo seo={seo} />
            <div className="storefront-container storefront-section max-w-lg">
                <h1 className="text-heading-xl text-ink">
                    {t('stripe.title')}
                </h1>
                <p className="text-caption-md mt-2 text-mute">
                    {t('stripe.orderSummary', {
                        orderNumber,
                        total: formatCurrency(total, locale),
                    })}
                </p>

                {!stripeKey ? (
                    <p className="text-caption-md mt-6 text-sale">
                        {t('stripe.notConfigured')}
                    </p>
                ) : (
                    <form id="stripe-payment-form" className="mt-8 space-y-6">
                        <div id="payment-element" />
                        {error && (
                            <p className="text-caption-md text-sale">{error}</p>
                        )}
                        <StorefrontButton
                            type="submit"
                            variant="primary"
                            className="w-full"
                            disabled={processing}
                        >
                            {t('stripe.payNow')}
                        </StorefrontButton>
                    </form>
                )}

                <StorefrontButton variant="secondary" className="mt-4" asChild>
                    <Link href={`/orders/confirmation/${orderNumber}`}>
                        {t('stripe.viewOrder')}
                    </Link>
                </StorefrontButton>
            </div>
        </>
    );
}
