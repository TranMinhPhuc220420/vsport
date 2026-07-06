import { Link } from '@inertiajs/react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { StorefrontBadge } from '@/components/storefront/Badge';
import { StorefrontButton } from '@/components/storefront/Button';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { formatCurrency, useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

export type ProductCardProps = {
    imageUrl?: string;
    name: string;
    subtitle?: string;
    price: number;
    salePrice?: number;
    badge?: string;
    colorways?: string[];
    href?: string;
    slug?: string;
    defaultVariantId?: number;
    defaultVariantPrice?: number;
    inStock?: boolean;
    className?: string;
};

function ProductCardQuickActions({
    slug,
    name,
    imageUrl,
    price,
    salePrice,
    defaultVariantId,
    defaultVariantPrice,
    inStock = true,
}: {
    slug: string;
    name: string;
    imageUrl?: string;
    price: number;
    salePrice?: number;
    defaultVariantId?: number;
    defaultVariantPrice?: number;
    inStock?: boolean;
}) {
    const { t } = useTranslation('storefront');
    const { addItem } = useCart();
    const { isWishlisted, toggleItem } = useWishlist();
    const [heartPop, setHeartPop] = useState(false);
    const wishlisted = isWishlisted(slug);
    const canQuickAdd = inStock && defaultVariantId !== undefined;

    const handleWishlistClick = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        toggleItem({
            productSlug: slug,
            productName: name,
            imageUrl,
            price,
            salePrice,
        });

        setHeartPop(true);
        event.currentTarget.blur();
        toast.success(wishlisted ? t('wishlist.removed') : t('wishlist.added'));
    };

    const handleAddToCartClick = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        if (!canQuickAdd) {
            return;
        }

        addItem({
            variantId: defaultVariantId,
            productSlug: slug,
            productName: name,
            colorName: '',
            size: '',
            unitPrice: defaultVariantPrice ?? salePrice ?? price,
            imageUrl,
        });

        event.currentTarget.blur();
        toast.success(t('pdp.addedToBag'));
    };

    return (
        <div className="absolute right-3 bottom-3 z-[2] flex gap-2">
            <StorefrontButton
                type="button"
                variant="icon"
                className="product-card-quick-action bg-canvas/95 backdrop-blur-[2px]"
                style={{ '--quick-action-index': 0 } as CSSProperties}
                aria-label={
                    wishlisted
                        ? t('wishlist.removeFromWishlist')
                        : t('wishlist.addToWishlist')
                }
                aria-pressed={wishlisted}
                onClick={handleWishlistClick}
            >
                <Heart
                    className={cn(
                        'size-5 transition-colors duration-200',
                        wishlisted && 'fill-current text-sale',
                        heartPop && 'product-card-heart-pop',
                    )}
                    onAnimationEnd={() => setHeartPop(false)}
                />
            </StorefrontButton>
            <StorefrontButton
                type="button"
                variant="icon"
                className="product-card-quick-action bg-canvas/95 backdrop-blur-[2px]"
                style={{ '--quick-action-index': 1 } as CSSProperties}
                aria-label={t('pdp.addToBag')}
                disabled={!canQuickAdd}
                onClick={handleAddToCartClick}
            >
                <ShoppingBag className="size-5" />
            </StorefrontButton>
        </div>
    );
}

function ProductCard({
    imageUrl,
    name,
    subtitle,
    price,
    salePrice,
    badge,
    colorways = [],
    href,
    slug,
    defaultVariantId,
    defaultVariantPrice,
    inStock = true,
    className,
}: ProductCardProps) {
    const { locale, currency } = useLocale();
    const onSale = salePrice !== undefined && salePrice < price;
    const discountPercent = onSale
        ? Math.round(((price - salePrice) / price) * 100)
        : 0;
    const showQuickActions = slug !== undefined;

    const imageContent = imageUrl ? (
        <img
            src={imageUrl}
            alt={name}
            className="motion-safe-hover-scale size-full object-cover"
            loading="lazy"
        />
    ) : (
        <div className="text-caption-md flex size-full items-center justify-center text-mute">
            No image
        </div>
    );

    const infoContent = (
        <>
            {colorways.length > 0 && (
                <div className="flex items-center gap-1.5">
                    {colorways.map((color, index) => (
                        <span
                            key={`${color}-${index}`}
                            className="size-3 rounded-full ring-1 ring-hairline"
                            style={{ backgroundColor: color }}
                            aria-hidden
                        />
                    ))}
                </div>
            )}

            <h3 className="text-body-strong text-ink">{name}</h3>

            {subtitle && (
                <p className="text-caption-md text-mute">{subtitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                {onSale ? (
                    <>
                        <span className="text-body-strong text-sale">
                            {formatCurrency(salePrice, locale, currency)}
                        </span>
                        <span className="text-caption-md text-mute line-through">
                            {formatCurrency(price, locale, currency)}
                        </span>
                        <StorefrontBadge variant="sale">
                            {discountPercent}% off
                        </StorefrontBadge>
                    </>
                ) : (
                    <span className="text-body-strong text-ink">
                        {formatCurrency(price, locale, currency)}
                    </span>
                )}
            </div>
        </>
    );

    return (
        <article
            data-slot="product-card"
            className={cn('group flex flex-col bg-canvas', className)}
        >
            <div className="relative aspect-square overflow-hidden bg-soft-cloud">
                <div
                    className="product-card-hover-scrim absolute inset-0 z-[1]"
                    aria-hidden
                />
                {href ? (
                    <Link href={href} className="block size-full">
                        {imageContent}
                    </Link>
                ) : (
                    imageContent
                )}
                {badge && (
                    <StorefrontBadge
                        variant="promo"
                        className="absolute top-3 left-3"
                    >
                        {badge}
                    </StorefrontBadge>
                )}
                {showQuickActions && (
                    <ProductCardQuickActions
                        slug={slug}
                        name={name}
                        imageUrl={imageUrl}
                        price={price}
                        salePrice={salePrice}
                        defaultVariantId={defaultVariantId}
                        defaultVariantPrice={defaultVariantPrice}
                        inStock={inStock}
                    />
                )}
            </div>

            {href ? (
                <Link
                    href={href}
                    className="flex flex-col gap-2 pt-2 transition-opacity duration-200 group-hover:opacity-90"
                >
                    {infoContent}
                </Link>
            ) : (
                <div className="flex flex-col gap-2 pt-2 transition-opacity duration-200 group-hover:opacity-90">
                    {infoContent}
                </div>
            )}
        </article>
    );
}

function ProductCardSkeleton() {
    return (
        <div className="flex flex-col" aria-hidden>
            <div className="aspect-square animate-pulse bg-soft-cloud" />
            <div className="space-y-2 pt-2">
                <div className="h-3 w-3/4 animate-pulse rounded-sm bg-soft-cloud" />
                <div className="h-3 w-1/2 animate-pulse rounded-sm bg-soft-cloud" />
                <div className="h-3 w-1/3 animate-pulse rounded-sm bg-soft-cloud" />
            </div>
        </div>
    );
}

export { ProductCard, ProductCardSkeleton };
