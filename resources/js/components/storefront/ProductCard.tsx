import { Link } from '@inertiajs/react';

import { StorefrontBadge } from '@/components/storefront/Badge';
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
    className?: string;
};

function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
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
    className,
}: ProductCardProps) {
    const onSale = salePrice !== undefined && salePrice < price;
    const discountPercent = onSale
        ? Math.round(((price - salePrice) / price) * 100)
        : 0;

    const content = (
        <>
            <div className="relative aspect-square overflow-hidden bg-soft-cloud">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="motion-safe-hover-scale size-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-caption-md text-mute">
                        No image
                    </div>
                )}
                {badge && (
                    <StorefrontBadge
                        variant="promo"
                        className="absolute top-3 left-3"
                    >
                        {badge}
                    </StorefrontBadge>
                )}
            </div>

            <div className="flex flex-col gap-2 pt-2 transition-opacity duration-200 group-hover:opacity-90">
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
                                {formatPrice(salePrice)}
                            </span>
                            <span className="text-caption-md text-mute line-through">
                                {formatPrice(price)}
                            </span>
                            <StorefrontBadge variant="sale">
                                {discountPercent}% off
                            </StorefrontBadge>
                        </>
                    ) : (
                        <span className="text-body-strong text-ink">
                            {formatPrice(price)}
                        </span>
                    )}
                </div>
            </div>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                data-slot="product-card"
                className={cn('group flex flex-col bg-canvas', className)}
            >
                {content}
            </Link>
        );
    }

    return (
        <article
            data-slot="product-card"
            className={cn('group flex flex-col bg-canvas', className)}
        >
            {content}
        </article>
    );
}

export { ProductCard };
