import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

type StarRatingProps = {
    rating: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
    reviewCount?: number;
    className?: string;
};

const sizeClasses = {
    sm: 'size-3',
    md: 'size-4',
    lg: 'size-5',
};

function StarRating({
    rating,
    max = 5,
    size = 'md',
    showCount = false,
    reviewCount = 0,
    className,
}: StarRatingProps) {
    const { t } = useTranslation('storefront');
    const iconSize = sizeClasses[size];

    return (
        <div
            data-slot="star-rating"
            className={cn('flex items-center gap-1.5', className)}
            aria-label={t('pdp.ratingSummary', {
                rating: rating.toFixed(1),
                count: reviewCount,
            })}
        >
            <div className="flex items-center gap-0.5">
                {Array.from({ length: max }, (_, index) => {
                    const starValue = index + 1;
                    const filled = rating >= starValue;
                    const half =
                        !filled && rating > index && rating < starValue;

                    return (
                        <Star
                            key={starValue}
                            className={cn(
                                iconSize,
                                filled || half
                                    ? 'fill-ink text-ink'
                                    : 'fill-none text-hairline',
                                half && 'opacity-60',
                            )}
                            strokeWidth={1.5}
                            aria-hidden
                        />
                    );
                })}
            </div>
            {showCount && reviewCount > 0 && (
                <span className="text-caption-md text-mute">
                    {t('pdp.ratingCount', { count: reviewCount })}
                </span>
            )}
        </div>
    );
}

export { StarRating };
