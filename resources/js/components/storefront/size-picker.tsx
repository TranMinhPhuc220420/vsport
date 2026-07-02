import { useTranslation } from 'react-i18next';

import { FilterChip } from '@/components/storefront/FilterChip';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@/types/catalog';

type SizePickerProps = {
    variants: ProductVariant[];
    selectedSize: string | null;
    onSelect: (size: string) => void;
    className?: string;
};

function SizePicker({
    variants,
    selectedSize,
    onSelect,
    className,
}: SizePickerProps) {
    const { t } = useTranslation('storefront');

    return (
        <div data-slot="size-picker" className={cn('space-y-3', className)}>
            <p className="text-caption-md text-mute">{t('pdp.selectSize')}</p>
            <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                    const outOfStock = !variant.stock.inStock;

                    return (
                        <FilterChip
                            key={variant.id}
                            active={selectedSize === variant.size}
                            disabled={outOfStock}
                            onClick={() => onSelect(variant.size)}
                            className={cn(outOfStock && 'line-through opacity-50')}
                        >
                            {variant.size}
                        </FilterChip>
                    );
                })}
            </div>
        </div>
    );
}

export { SizePicker };
