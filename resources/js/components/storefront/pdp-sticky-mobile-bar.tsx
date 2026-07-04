import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { AddToBagButton } from '@/components/storefront/add-to-bag-button';
import { formatCurrency, useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

type PdpStickyMobileBarProps = {
    productName: string;
    colorName?: string;
    imageUrl?: string;
    price: number;
    disabled: boolean;
    onAddToBag: () => void;
    observeRef: React.RefObject<HTMLElement | null>;
    className?: string;
};

function PdpStickyMobileBar({
    productName,
    colorName,
    imageUrl,
    price,
    disabled,
    onAddToBag,
    observeRef,
    className,
}: PdpStickyMobileBarProps) {
    const { locale } = useLocale();
    const [visible, setVisible] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const target = observeRef.current;

        if (!target) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setVisible(entry ? !entry.isIntersecting : false);
            },
            { threshold: 0 },
        );

        observer.observe(target);

        return () => observer.disconnect();
    }, [observeRef]);

    useLayoutEffect(() => {
        const root = document.documentElement;

        if (!visible) {
            root.style.removeProperty('--storefront-sticky-bottom-inset');

            return;
        }

        const updateInset = () => {
            const height = barRef.current?.offsetHeight ?? 0;

            root.style.setProperty(
                '--storefront-sticky-bottom-inset',
                `calc(${height}px + 3rem)`,
            );
        };

        updateInset();
        window.addEventListener('resize', updateInset);

        return () => {
            window.removeEventListener('resize', updateInset);
            root.style.removeProperty('--storefront-sticky-bottom-inset');
        };
    }, [visible]);

    return (
        <div
            ref={barRef}
            className={cn(
                'fixed inset-x-0 bottom-0 z-50 border-t border-hairline-soft bg-canvas px-4 pt-3 pb-[calc(0.75rem+var(--storefront-safe-bottom,0px))] transition-transform duration-300 ease-[var(--motion-ease)] desktop:hidden',
                visible ? 'translate-y-0' : 'translate-y-full',
                className,
            )}
            aria-hidden={!visible}
        >
            <div className="mx-auto flex min-w-0 max-w-[90rem] items-center gap-3">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt=""
                        className="size-12 shrink-0 bg-soft-cloud object-cover"
                        aria-hidden
                    />
                ) : null}
                <div className="min-w-0 flex-1">
                    <p className="text-body-strong truncate text-ink">
                        {productName}
                    </p>
                    {colorName ? (
                        <p className="text-caption-md truncate text-mute">
                            {colorName}
                        </p>
                    ) : null}
                    <p className="text-caption-md text-ink">
                        {formatCurrency(price, locale)}
                    </p>
                </div>
                <AddToBagButton
                    disabled={disabled}
                    onClick={onAddToBag}
                    className="shrink-0 px-4"
                />
            </div>
        </div>
    );
}

export { PdpStickyMobileBar };
