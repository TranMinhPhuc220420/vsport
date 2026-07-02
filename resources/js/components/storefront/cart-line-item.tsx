import { Link } from '@inertiajs/react';
import { Minus, Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { formatCurrency, useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import type { CartItem } from '@/types/cart';

type CartLineItemProps = {
    item: CartItem;
    onUpdateQuantity: (variantId: number, quantity: number) => void;
    onRemove: (variantId: number) => void;
    className?: string;
};

function CartLineItem({
    item,
    onUpdateQuantity,
    onRemove,
    className,
}: CartLineItemProps) {
    const { t } = useTranslation(['storefront', 'common']);
    const { locale } = useLocale();
    const lineTotal = item.unitPrice * item.quantity;

    return (
        <article
            data-slot="cart-line-item"
            className={cn(
                'flex gap-4 border-b border-hairline py-6',
                className,
            )}
        >
            <Link
                href={`/products/${item.productSlug}`}
                className="size-28 shrink-0 bg-soft-cloud"
            >
                {item.imageUrl ? (
                    <img
                        src={item.imageUrl}
                        alt={item.productName}
                        loading="lazy"
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="text-caption-md flex size-full items-center justify-center text-mute">
                        {t('common:noImage')}
                    </div>
                )}
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Link
                            href={`/products/${item.productSlug}`}
                            className="text-body-strong text-ink hover:underline"
                        >
                            {item.productName}
                        </Link>
                        <p className="text-caption-md text-mute">
                            {item.colorName} / {item.size}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onRemove(item.variantId)}
                        className="text-mute hover:text-ink"
                        aria-label={t('storefront:cart.removeItem')}
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StorefrontButton
                            variant="icon"
                            size="sm"
                            className="size-8"
                            aria-label={t('storefront:cart.decreaseQty')}
                            onClick={() =>
                                onUpdateQuantity(
                                    item.variantId,
                                    item.quantity - 1,
                                )
                            }
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="size-4" />
                        </StorefrontButton>
                        <span className="text-body-strong min-w-8 text-center">
                            {item.quantity}
                        </span>
                        <StorefrontButton
                            variant="icon"
                            size="sm"
                            className="size-8"
                            aria-label={t('storefront:cart.increaseQty')}
                            onClick={() =>
                                onUpdateQuantity(
                                    item.variantId,
                                    item.quantity + 1,
                                )
                            }
                        >
                            <Plus className="size-4" />
                        </StorefrontButton>
                    </div>
                    <span className="text-body-strong text-ink">
                        {formatCurrency(lineTotal, locale)}
                    </span>
                </div>
            </div>
        </article>
    );
}

export { CartLineItem };
