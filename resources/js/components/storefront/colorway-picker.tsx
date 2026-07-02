import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { ProductColorway } from '@/types/catalog';

type ColorwayPickerProps = {
    colorways: ProductColorway[];
    selectedId: number;
    onSelect: (id: number) => void;
    className?: string;
};

function getColorwayThumbnail(colorway: ProductColorway): string | null {
    const primary =
        colorway.images.find((image) => image.isPrimary) ??
        colorway.images[0];

    return primary?.url ?? null;
}

function ColorwayPicker({
    colorways,
    selectedId,
    onSelect,
    className,
}: ColorwayPickerProps) {
    const { t } = useTranslation('storefront');
    const selected = colorways.find((colorway) => colorway.id === selectedId);

    return (
        <div data-slot="colorway-picker" className={cn('space-y-3', className)}>
            <p className="text-caption-md text-mute">
                {t('pdp.color')}{' '}
                <span className="text-ink">{selected?.colorName}</span>
            </p>
            <div className="flex flex-wrap gap-2">
                {colorways.map((colorway) => {
                    const thumbnail = getColorwayThumbnail(colorway);
                    const isSelected = selectedId === colorway.id;

                    return (
                        <button
                            key={colorway.id}
                            type="button"
                            onClick={() => onSelect(colorway.id)}
                            className={cn(
                                'size-14 overflow-hidden border border-hairline bg-soft-cloud transition-[ring-color] duration-200',
                                isSelected
                                    ? 'ring-2 ring-ink'
                                    : 'ring-0 ring-transparent',
                            )}
                            aria-label={colorway.colorName}
                            aria-pressed={isSelected}
                        >
                            {thumbnail ? (
                                <img
                                    src={thumbnail}
                                    alt={colorway.colorName}
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                            ) : (
                                <span
                                    className="block size-full"
                                    style={{
                                        backgroundColor: colorway.swatchColor,
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export { ColorwayPicker };
