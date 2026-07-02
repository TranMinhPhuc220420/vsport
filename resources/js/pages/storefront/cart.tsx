import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { CartLineItem } from '@/components/storefront/cart-line-item';
import { CartSummary } from '@/components/storefront/cart-summary';
import { StorefrontButton } from '@/components/storefront/Button';
import { PageSeo, type SeoData } from '@/components/storefront/page-seo';
import { useCart } from '@/contexts/cart-context';

type CartPageProps = {
    seo: SeoData;
};

function CartLoadingSkeleton() {
    return (
        <div className="mt-8 animate-pulse space-y-6">
            <div className="h-24 bg-soft-cloud" />
            <div className="h-24 bg-soft-cloud" />
        </div>
    );
}

export default function CartPage({ seo }: CartPageProps) {
    const { t } = useTranslation('storefront');
    const { items, itemCount, subtotal, updateQuantity, removeItem, ready } =
        useCart();

    return (
        <>
            <PageSeo seo={seo} />

            <div className="storefront-container storefront-section">
                <h1 className="text-heading-xl text-ink">{t('cart.title')}</h1>

                {!ready ? (
                    <CartLoadingSkeleton />
                ) : items.length === 0 ? (
                    <div className="py-section text-center">
                        <p className="text-body-strong text-mute">
                            {t('cart.empty')}
                        </p>
                        <StorefrontButton
                            variant="primary"
                            className="mt-6"
                            asChild
                        >
                            <Link href="/men">{t('cart.continueShopping')}</Link>
                        </StorefrontButton>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-8 desktop:grid-cols-[1fr_320px]">
                        <div>
                            {items.map((item) => (
                                <CartLineItem
                                    key={item.variantId}
                                    item={item}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeItem}
                                />
                            ))}
                        </div>
                        <CartSummary subtotal={subtotal} itemCount={itemCount} />
                    </div>
                )}
            </div>
        </>
    );
}
