import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import type { ProductImage } from '@/types/catalog';

type ProductLightboxProps = {
    images: ProductImage[];
    productName: string;
    initialIndex?: number;
    open: boolean;
    onClose: () => void;
};

function ProductLightbox({
    images,
    productName,
    initialIndex = 0,
    open,
    onClose,
}: ProductLightboxProps) {
    const { t } = useTranslation('storefront');
    const [activeIndex, setActiveIndex] = useState(initialIndex);

    const goTo = useCallback(
        (index: number) => {
            const count = images.length;

            if (count === 0) {
                return;
            }

            setActiveIndex(((index % count) + count) % count);
        },
        [images.length],
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }

            if (event.key === 'ArrowLeft') {
                goTo(activeIndex - 1);
            }

            if (event.key === 'ArrowRight') {
                goTo(activeIndex + 1);
            }
        };

        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose, goTo, activeIndex]);

    if (!open || images.length === 0) {
        return null;
    }

    const activeImage = images[activeIndex];

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={productName}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90"
            onClick={onClose}
        >
            <StorefrontButton
                type="button"
                variant="icon"
                className="absolute top-4 right-4 z-10 bg-canvas/10 text-canvas hover:bg-canvas/20"
                aria-label={t('pdp.closeLightbox')}
                onClick={(event) => {
                    event.stopPropagation();
                    onClose();
                }}
            >
                <X className="size-5" />
            </StorefrontButton>

            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        aria-label="Previous image"
                        className="absolute top-1/2 left-4 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/10 text-canvas transition hover:bg-canvas/20"
                        onClick={(event) => {
                            event.stopPropagation();
                            goTo(activeIndex - 1);
                        }}
                    >
                        <ChevronLeft className="size-6" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next image"
                        className="absolute top-1/2 right-4 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/10 text-canvas transition hover:bg-canvas/20"
                        onClick={(event) => {
                            event.stopPropagation();
                            goTo(activeIndex + 1);
                        }}
                    >
                        <ChevronRight className="size-6" />
                    </button>
                </>
            )}

            <img
                src={activeImage.url}
                alt={activeImage.alt || productName}
                className="max-h-[90vh] max-w-[90vw] object-contain"
                onClick={(event) => event.stopPropagation()}
            />

            {images.length > 1 && (
                <p className="text-caption-md absolute bottom-6 left-1/2 -translate-x-1/2 text-canvas/70">
                    {activeIndex + 1} / {images.length}
                </p>
            )}
        </div>,
        document.body,
    );
}

export { ProductLightbox };
