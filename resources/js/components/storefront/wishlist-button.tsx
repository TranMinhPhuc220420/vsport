import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { StorefrontButton } from '@/components/storefront/Button';
import { useWishlist } from '@/contexts/wishlist-context';
import { cn } from '@/lib/utils';
import type { WishlistItem } from '@/types/wishlist';

type WishlistButtonProps = {
    item: WishlistItem;
    className?: string;
    showLabel?: boolean;
};

export function WishlistButton({
    item,
    className,
    showLabel = false,
}: WishlistButtonProps) {
    const { t } = useTranslation('storefront');
    const { isWishlisted, toggleItem } = useWishlist();
    const active = isWishlisted(item.productSlug);

    const handleClick = () => {
        toggleItem(item);

        toast.success(active ? t('wishlist.removed') : t('wishlist.added'));
    };

    return (
        <StorefrontButton
            type="button"
            variant={showLabel ? 'secondary' : 'icon'}
            className={cn(className)}
            aria-label={
                active
                    ? t('wishlist.removeFromWishlist')
                    : t('wishlist.addToWishlist')
            }
            aria-pressed={active}
            onClick={handleClick}
        >
            <Heart
                className={cn('size-5', active && 'fill-current text-sale')}
            />
            {showLabel && (
                <span>{active ? t('wishlist.saved') : t('wishlist.save')}</span>
            )}
        </StorefrontButton>
    );
}
