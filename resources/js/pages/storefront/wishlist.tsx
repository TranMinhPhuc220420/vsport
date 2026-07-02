import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { useWishlist } from '@/contexts/wishlist-context';
import { formatCurrency, useLocale } from '@/hooks/use-locale';

export default function WishlistPage() {
    const { t } = useTranslation('storefront');
    const { locale } = useLocale();
    const { items, removeItem } = useWishlist();

    return (
        <>
            <Head title={t('wishlist.title')} />

            <div className="storefront-container storefront-section">
                <h1 className="text-heading-xl text-ink">{t('wishlist.title')}</h1>
                <p className="mt-2 text-caption-md text-mute">
                    {t('wishlist.description')}
                </p>

                {items.length === 0 ? (
                    <div className="mt-12 text-center">
                        <p className="text-body-strong text-mute">
                            {t('wishlist.empty')}
                        </p>
                        <StorefrontButton
                            variant="primary"
                            className="mt-6"
                            asChild
                        >
                            <Link href="/">{t('wishlist.shopNow')}</Link>
                        </StorefrontButton>
                    </div>
                ) : (
                    <ul className="mt-8 divide-y divide-hairline">
                        {items.map((item) => {
                            const displayPrice = item.salePrice ?? item.price;

                            return (
                                <li
                                    key={item.productSlug}
                                    className="flex gap-4 py-6 first:pt-0"
                                >
                                    <Link
                                        href={`/products/${item.productSlug}`}
                                        className="size-24 shrink-0 bg-soft-cloud"
                                    >
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex size-full items-center justify-center text-caption-md text-mute">
                                                —
                                            </div>
                                        )}
                                    </Link>

                                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                                        <Link
                                            href={`/products/${item.productSlug}`}
                                            className="text-body-strong text-ink hover:underline"
                                        >
                                            {item.productName}
                                        </Link>
                                        <p className="text-caption-md text-ink">
                                            {formatCurrency(displayPrice, locale)}
                                        </p>
                                        <StorefrontButton
                                            type="button"
                                            variant="secondary"
                                            className="mt-2 w-fit"
                                            onClick={() =>
                                                removeItem(item.productSlug)
                                            }
                                        >
                                            {t('wishlist.remove')}
                                        </StorefrontButton>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </>
    );
}
