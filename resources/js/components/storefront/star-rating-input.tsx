import { Star } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

type StarRatingInputProps = {
    value: number;
    onChange: (value: number) => void;
    max?: number;
    size?: 'md' | 'lg';
    className?: string;
    id?: string;
};

const sizeClasses = {
    md: 'size-8',
    lg: 'size-10',
};

function StarRatingInput({
    value,
    onChange,
    max = 5,
    size = 'lg',
    className,
    id,
}: StarRatingInputProps) {
    const { t } = useTranslation('storefront');
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    const displayValue = hoverValue ?? value;
    const iconSize = sizeClasses[size];

    return (
        <div className={cn('space-y-2', className)}>
            <div
                id={id}
                role="radiogroup"
                aria-label={t('pdp.yourRating')}
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverValue(null)}
            >
                {Array.from({ length: max }, (_, index) => {
                    const starValue = index + 1;
                    const filled = displayValue >= starValue;

                    return (
                        <button
                            key={starValue}
                            type="button"
                            role="radio"
                            aria-checked={value === starValue}
                            aria-label={t('pdp.stars', { n: starValue })}
                            className={cn(
                                'rounded-full p-1 transition-transform outline-none',
                                'hover:scale-110 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2',
                            )}
                            onMouseEnter={() => setHoverValue(starValue)}
                            onFocus={() => setHoverValue(starValue)}
                            onBlur={() => setHoverValue(null)}
                            onClick={() => onChange(starValue)}
                        >
                            <Star
                                className={cn(
                                    iconSize,
                                    filled
                                        ? 'fill-ink text-ink'
                                        : 'fill-none text-hairline',
                                )}
                                strokeWidth={1.5}
                                aria-hidden
                            />
                        </button>
                    );
                })}
            </div>
            <p className="text-caption-md text-mute" aria-live="polite">
                {t(
                    `pdp.ratingLabels.${Math.min(5, Math.max(1, displayValue))}` as
                        | 'pdp.ratingLabels.1'
                        | 'pdp.ratingLabels.2'
                        | 'pdp.ratingLabels.3'
                        | 'pdp.ratingLabels.4'
                        | 'pdp.ratingLabels.5',
                )}
            </p>
        </div>
    );
}

export { StarRatingInput };
export default StarRatingInput;
