import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/catalog';

type ProductGalleryProps = {
    images: ProductImage[];
    productName: string;
    className?: string;
};

function ProductGallery({ images, productName, className }: ProductGalleryProps) {
    const { t } = useTranslation('common');
    const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const activeIndex = Math.min(selectedIndex, Math.max(sorted.length - 1, 0));

    if (sorted.length === 0) {
        return (
            <div
                className={cn(
                    'flex aspect-square items-center justify-center bg-soft-cloud text-mute',
                    className,
                )}
            >
                {t('noImage')}
            </div>
        );
    }

    return (
        <div
            data-slot="product-gallery"
            className={cn('flex gap-2 tablet:gap-4', className)}
        >
            {sorted.length > 1 && (
                <div className="hidden flex-col gap-2 tablet:flex">
                    {sorted.map((image, index) => (
                        <button
                            key={`${image.url}-${image.sortOrder}`}
                            type="button"
                            onClick={() => setSelectedIndex(index)}
                            className={cn(
                                'size-16 overflow-hidden border border-hairline bg-soft-cloud transition-[box-shadow,ring-color] duration-200',
                                index === activeIndex
                                    ? 'ring-2 ring-ink'
                                    : 'ring-0 ring-transparent',
                            )}
                            aria-label={image.alt}
                            aria-current={index === activeIndex}
                        >
                            <img
                                src={image.url}
                                alt={image.alt}
                                loading="lazy"
                                className="size-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            <div className="relative aspect-square flex-1 bg-soft-cloud">
                {sorted.map((image, index) => (
                    <img
                        key={`${image.url}-${image.sortOrder}`}
                        src={image.url}
                        alt={image.alt || productName}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className={cn(
                            'absolute inset-0 size-full object-cover transition-opacity duration-300 ease-[var(--motion-ease)]',
                            index === activeIndex
                                ? 'opacity-100'
                                : 'pointer-events-none opacity-0',
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

export { ProductGallery };
