import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

type ProductRailProps = {
    children: ReactNode;
    className?: string;
};

type ScrollEdges = {
    canScrollLeft: boolean;
    canScrollRight: boolean;
};

const railButtonClassName =
    'absolute top-[calc(var(--rail-image-center,0px)-1.375rem)] z-10 flex size-11 items-center justify-center rounded-full border border-hairline bg-canvas/95 text-ink shadow-md backdrop-blur-sm transition hover:bg-canvas disabled:pointer-events-none disabled:opacity-30';

function ProductRail({ children, className }: ProductRailProps) {
    const { t } = useTranslation('common');
    const railRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState<ScrollEdges>({
        canScrollLeft: false,
        canScrollRight: false,
    });

    const updateRailMetrics = useCallback(() => {
        const element = scrollRef.current;
        const rail = railRef.current;

        if (!element || !rail) {
            return;
        }

        const maxScrollLeft = element.scrollWidth - element.clientWidth;

        setEdges({
            canScrollLeft: element.scrollLeft > 4,
            canScrollRight: element.scrollLeft < maxScrollLeft - 4,
        });

        const image = element.querySelector(
            '[data-slot="product-card"] .aspect-square',
        );

        const imageHeight =
            image instanceof HTMLElement
                ? image.getBoundingClientRect().height
                : element.clientWidth;

        rail.style.setProperty(
            '--rail-image-center',
            `${imageHeight / 2}px`,
        );
    }, []);

    useEffect(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        updateRailMetrics();

        const observer = new ResizeObserver(updateRailMetrics);
        observer.observe(element);

        element.addEventListener('scroll', updateRailMetrics, { passive: true });

        const mobileQuery = window.matchMedia('(max-width: 39.9375rem)');

        let touchStartX = 0;
        let touchStartY = 0;
        let touchAxis: 'x' | 'y' | null = null;

        const resetTouchAxis = () => {
            touchAxis = null;
        };

        const onTouchStart = (event: TouchEvent) => {
            if (event.touches.length !== 1) {
                return;
            }

            touchStartX = event.touches[0].clientX;
            touchStartY = event.touches[0].clientY;
            touchAxis = null;
        };

        const onTouchMove = (event: TouchEvent) => {
            if (!mobileQuery.matches || event.touches.length !== 1) {
                return;
            }

            const deltaX = event.touches[0].clientX - touchStartX;
            const deltaY = event.touches[0].clientY - touchStartY;

            if (
                touchAxis === null &&
                (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8)
            ) {
                touchAxis =
                    Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
            }

            if (touchAxis === 'y') {
                element.style.overflowX = 'hidden';
                return;
            }

            element.style.overflowX = '';
        };

        const onTouchEnd = () => {
            element.style.overflowX = '';
            resetTouchAxis();
        };

        element.addEventListener('touchstart', onTouchStart, { passive: true });
        element.addEventListener('touchmove', onTouchMove, { passive: true });
        element.addEventListener('touchend', onTouchEnd, { passive: true });
        element.addEventListener('touchcancel', onTouchEnd, { passive: true });

        return () => {
            observer.disconnect();
            element.removeEventListener('scroll', updateRailMetrics);
            element.removeEventListener('touchstart', onTouchStart);
            element.removeEventListener('touchmove', onTouchMove);
            element.removeEventListener('touchend', onTouchEnd);
            element.removeEventListener('touchcancel', onTouchEnd);
            element.style.overflowX = '';
        };
    }, [updateRailMetrics, children]);

    const scrollByDirection = useCallback((direction: 'prev' | 'next') => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        const track = element.firstElementChild;

        if (!(track instanceof HTMLElement)) {
            return;
        }

        const firstItem = track.querySelector('[data-slot="product-rail-item"]');

        if (!(firstItem instanceof HTMLElement)) {
            return;
        }

        const gap = Number.parseFloat(getComputedStyle(track).gap || '0');
        const distance = firstItem.getBoundingClientRect().width + gap;

        element.scrollBy({
            left: direction === 'next' ? distance : -distance,
            behavior: 'smooth',
        });
    }, []);

    const showControls = edges.canScrollLeft || edges.canScrollRight;

    return (
        <div data-slot="product-rail" className={className}>
            <div ref={railRef} className="relative">
                <div
                    ref={scrollRef}
                    className="overflow-x-auto touch-manipulation [overscroll-behavior-x:contain] [-webkit-overflow-scrolling:touch] snap-x snap-mandatory scrollbar-none tablet:overflow-hidden tablet:snap-none tablet:touch-auto"
                >
                    <div className="flex gap-2 desktop:gap-3">
                        {children}
                    </div>
                </div>

                {showControls ? (
                    <>
                        <button
                            type="button"
                            onClick={() => scrollByDirection('prev')}
                            disabled={!edges.canScrollLeft}
                            aria-label={t('previous')}
                            className={cn(
                                railButtonClassName,
                                'left-[1.375rem] -translate-x-1/2',
                            )}
                        >
                            <ChevronLeft className="size-6" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scrollByDirection('next')}
                            disabled={!edges.canScrollRight}
                            aria-label={t('next')}
                            className={cn(
                                railButtonClassName,
                                'right-[1.375rem] translate-x-1/2',
                            )}
                        >
                            <ChevronRight className="size-6" />
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    );
}

type ProductRailItemProps = {
    children: ReactNode;
    className?: string;
    index?: number;
};

function ProductRailItem({
    children,
    className,
    index = 0,
}: ProductRailItemProps) {
    return (
        <div
            data-slot="product-rail-item"
            className={cn('shrink-0 basis-full snap-center tablet:snap-none', className)}
            style={{ '--stagger-index': index } as CSSProperties}
        >
            {children}
        </div>
    );
}

export { ProductRail, ProductRailItem };
