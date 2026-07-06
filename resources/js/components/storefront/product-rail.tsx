import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
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

const TABLET_MIN_WIDTH = '(min-width: 40rem)';
const DESKTOP_MIN_WIDTH = '(min-width: 64rem)';
const DESKTOP_LG_MIN_WIDTH = '(min-width: 75rem)';
const MOBILE_MAX_WIDTH = '(max-width: 39.9375rem)';

function visibleProductCount(): number {
    if (window.matchMedia(DESKTOP_LG_MIN_WIDTH).matches) {
        return 4;
    }

    if (window.matchMedia(DESKTOP_MIN_WIDTH).matches) {
        return 3;
    }

    if (window.matchMedia(TABLET_MIN_WIDTH).matches) {
        return 2;
    }

    return 1;
}

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
        const track = element?.firstElementChild;

        if (!element || !rail || !(track instanceof HTMLElement)) {
            return;
        }

        const gap = Number.parseFloat(getComputedStyle(track).gap || '0');
        const visibleCount = visibleProductCount();
        const itemBasis =
            (element.clientWidth - gap * (visibleCount - 1)) / visibleCount;

        rail.style.setProperty('--rail-item-basis', `${itemBasis}px`);

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
                : itemBasis;

        rail.style.setProperty('--rail-image-center', `${imageHeight / 2}px`);
    }, []);

    useEffect(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        updateRailMetrics();

        const observer = new ResizeObserver(updateRailMetrics);
        observer.observe(element);

        element.addEventListener('scroll', updateRailMetrics, {
            passive: true,
        });

        const mobileQuery = window.matchMedia(MOBILE_MAX_WIDTH);
        const mediaQueries = [
            window.matchMedia(MOBILE_MAX_WIDTH),
            window.matchMedia(TABLET_MIN_WIDTH),
            window.matchMedia(DESKTOP_MIN_WIDTH),
            window.matchMedia(DESKTOP_LG_MIN_WIDTH),
        ];

        const onMediaChange = () => {
            element.scrollLeft = 0;
            updateRailMetrics();
        };

        for (const query of mediaQueries) {
            query.addEventListener('change', onMediaChange);
        }

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
                touchAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
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

            for (const query of mediaQueries) {
                query.removeEventListener('change', onMediaChange);
            }

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

        const firstItem = track.querySelector(
            '[data-slot="product-rail-item"]',
        );

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
                    className="touch-manipulation snap-x snap-mandatory scrollbar-none overflow-x-auto [overscroll-behavior-x:contain] [-webkit-overflow-scrolling:touch] tablet:touch-auto tablet:snap-none tablet:overflow-hidden"
                >
                    <div className="flex gap-2 desktop:gap-3">{children}</div>
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
            className={cn(
                'shrink-0 grow-0 basis-[var(--rail-item-basis,100%)] snap-center tablet:snap-none',
                className,
            )}
            style={{ '--stagger-index': index } as CSSProperties}
        >
            {children}
        </div>
    );
}

export { ProductRail, ProductRailItem };
