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

function ProductRail({ children, className }: ProductRailProps) {
    const { t } = useTranslation('common');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [edges, setEdges] = useState<ScrollEdges>({
        canScrollLeft: false,
        canScrollRight: false,
    });

    const updateEdges = useCallback(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        const maxScrollLeft = element.scrollWidth - element.clientWidth;

        setEdges({
            canScrollLeft: element.scrollLeft > 4,
            canScrollRight: element.scrollLeft < maxScrollLeft - 4,
        });
    }, []);

    useEffect(() => {
        const element = scrollRef.current;

        if (!element) {
            return;
        }

        updateEdges();

        const observer = new ResizeObserver(updateEdges);
        observer.observe(element);

        element.addEventListener('scroll', updateEdges, { passive: true });

        const handleWheel = (event: WheelEvent) => {
            if (element.scrollWidth <= element.clientWidth) {
                return;
            }

            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
                return;
            }

            event.preventDefault();
            element.scrollLeft += event.deltaY;
        };

        element.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            observer.disconnect();
            element.removeEventListener('scroll', updateEdges);
            element.removeEventListener('wheel', handleWheel);
        };
    }, [updateEdges, children]);

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
        <div
            data-slot="product-rail"
            className={cn('relative', className)}
        >
            {showControls ? (
                <>
                    <button
                        type="button"
                        onClick={() => scrollByDirection('prev')}
                        disabled={!edges.canScrollLeft}
                        aria-label={t('previous')}
                        className="absolute top-[calc(50%-3.5rem)] left-0 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-canvas text-ink shadow-sm transition hover:bg-soft-cloud disabled:pointer-events-none disabled:opacity-30 tablet:flex"
                    >
                        <ChevronLeft className="size-6" />
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollByDirection('next')}
                        disabled={!edges.canScrollRight}
                        aria-label={t('next')}
                        className="absolute top-[calc(50%-3.5rem)] right-0 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-canvas text-ink shadow-sm transition hover:bg-soft-cloud disabled:pointer-events-none disabled:opacity-30 tablet:flex"
                    >
                        <ChevronRight className="size-6" />
                    </button>
                </>
            ) : null}

            <div
                ref={scrollRef}
                className="-mx-4 overflow-x-auto scroll-ps-4 scroll-pe-4 pb-2 scrollbar-none [overscroll-behavior-x:contain] [touch-action:pan-x] tablet:mx-0 tablet:scroll-ps-0 tablet:scroll-pe-0"
            >
                <div className="flex w-max snap-x snap-mandatory gap-2 px-4 tablet:px-0 desktop:gap-3">
                    {children}
                </div>
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
                'w-[72vw] shrink-0 snap-start tablet:w-[45vw] desktop:w-[min(26rem,32vw)]',
                className,
            )}
            style={{ '--stagger-index': index } as CSSProperties}
        >
            {children}
        </div>
    );
}

export { ProductRail, ProductRailItem };
