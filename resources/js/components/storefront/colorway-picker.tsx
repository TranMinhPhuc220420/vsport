import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { ProductColorway } from '@/types/catalog';

type ColorwayPickerProps = {
    colorways: ProductColorway[];
    selectedId: number;
    onSelect: (id: number) => void;
    className?: string;
};

function ColorwayPicker({
    colorways,
    selectedId,
    onSelect,
    className,
}: ColorwayPickerProps) {
    const { t } = useTranslation('storefront');

    return (
        <div data-slot="colorway-picker" className={cn('space-y-3', className)}>
            <p className="text-caption-md text-mute">
                {t('pdp.color')}{' '}
                <span className="text-ink">
                    {colorways.find((c) => c.id === selectedId)?.colorName}
                </span>
            </p>
            <div className="flex flex-wrap gap-3">
                {colorways.map((colorway) => (
                    <button
                        key={colorway.id}
                        type="button"
                        onClick={() => onSelect(colorway.id)}
                        className={cn(
                            'size-8 rounded-full ring-1 ring-hairline',
                            selectedId === colorway.id && 'ring-2 ring-ink',
                        )}
                        style={{ backgroundColor: colorway.swatchColor }}
                        aria-label={colorway.colorName}
                        aria-pressed={selectedId === colorway.id}
                    />
                ))}
            </div>
        </div>
    );
}

export { ColorwayPicker };
