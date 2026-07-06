import { useCallback, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { ProductLightbox } from '@/components/storefront/product-lightbox';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/catalog';

type ProductGalleryProps = {
    images: ProductImage[];
    productName: string;
    className?: string;
};

function ProductGallery({
    images,
    productName,
    className,
}: ProductGalleryProps) {
    const { t } = useTranslation('common');
    const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [zoomOrigin, setZoomOrigin] = useState('50% 50%');
    const [isZooming, setIsZooming] = useState(false);
    const mobileScrollRef = useRef<HTMLDivElement>(null);
    const activeIndex = Math.min(selectedIndex, Math.max(sorted.length - 1, 0));

    const handleMobileScroll = useCallback(() => {
        const container = mobileScrollRef.current;

        if (!container || sorted.length <= 1) {
            return;
        }

        const slideWidth = container.clientWidth;

        if (slideWidth === 0) {
            return;
        }

        const index = Math.round(container.scrollLeft / slideWidth);
        setSelectedIndex(index);
    }, [sorted.length]);

    const handleDesktopMouseMove = (event: MouseEvent<HTMLDivElement>) => {
        if (!window.matchMedia('(hover: hover)').matches) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setZoomOrigin(`${x}% ${y}%`);
    };

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
        <>
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

                <div className="flex-1">
                    <div
                        className="relative hidden aspect-square cursor-zoom-in overflow-hidden bg-soft-cloud tablet:block"
                        onMouseEnter={() => setIsZooming(true)}
                        onMouseLeave={() => setIsZooming(false)}
                        onMouseMove={handleDesktopMouseMove}
                        onClick={() => setLightboxOpen(true)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                setLightboxOpen(true);
                            }
                        }}
                        aria-label={productName}
                    >
                        <img
                            src={sorted[activeIndex].url}
                            alt={sorted[activeIndex].alt || productName}
                            loading="eager"
                            className={cn(
                                'motion-gallery-zoom size-full object-cover transition-transform duration-300 ease-[var(--motion-ease)]',
                                isZooming && 'scale-150',
                            )}
                            style={
                                {
                                    transformOrigin: zoomOrigin,
                                } as CSSProperties
                            }
                        />
                    </div>

                    <div className="tablet:hidden">
                        <div
                            ref={mobileScrollRef}
                            onScroll={handleMobileScroll}
                            className="-mx-4 flex snap-x snap-mandatory scrollbar-none overflow-x-auto px-4 pb-2"
                        >
                            {sorted.map((image, index) => (
                                <button
                                    key={`${image.url}-${image.sortOrder}`}
                                    type="button"
                                    className="w-full shrink-0 snap-center"
                                    onClick={() => {
                                        setSelectedIndex(index);
                                        setLightboxOpen(true);
                                    }}
                                    aria-label={image.alt}
                                >
                                    <div className="aspect-square bg-soft-cloud">
                                        <img
                                            src={image.url}
                                            alt={image.alt || productName}
                                            loading={
                                                index === 0 ? 'eager' : 'lazy'
                                            }
                                            className="size-full object-cover"
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {sorted.length > 1 && (
                            <div className="mt-3 flex justify-center gap-2">
                                {sorted.map((image, index) => (
                                    <button
                                        key={`dot-${image.url}`}
                                        type="button"
                                        aria-label={`Image ${index + 1}`}
                                        aria-current={index === activeIndex}
                                        onClick={() => {
                                            setSelectedIndex(index);
                                            const container =
                                                mobileScrollRef.current;

                                            if (container) {
                                                container.scrollTo({
                                                    left:
                                                        index *
                                                        container.clientWidth,
                                                    behavior: 'smooth',
                                                });
                                            }
                                        }}
                                        className={cn(
                                            'h-2 rounded-full bg-hairline transition-all duration-300',
                                            index === activeIndex
                                                ? 'w-6 bg-ink'
                                                : 'w-2',
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ProductLightbox
                key={activeIndex}
                images={sorted}
                productName={productName}
                initialIndex={activeIndex}
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </>
    );
}

export { ProductGallery };
