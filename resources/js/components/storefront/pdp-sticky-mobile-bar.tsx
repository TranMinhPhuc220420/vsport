import { useEffect, useState } from 'react';

import { AddToBagButton } from '@/components/storefront/add-to-bag-button';
import { cn } from '@/lib/utils';
import { formatCurrency, useLocale } from '@/hooks/use-locale';

type PdpStickyMobileBarProps = {
    productName: string;
    price: number;
    disabled: boolean;
    onAddToBag: () => void;
    observeRef: React.RefObject<HTMLElement | null>;
    className?: string;
};

function PdpStickyMobileBar({
    productName,
    price,
    disabled,
    onAddToBag,
    observeRef,
    className,
}: PdpStickyMobileBarProps) {
    const { locale } = useLocale();
    const [visible, setVisible] = useState(false);

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

    return (
        <div
            className={cn(
                'fixed inset-x-0 bottom-0 z-40 border-t border-hairline-soft bg-canvas px-4 py-3 transition-transform duration-300 ease-[var(--motion-ease)] desktop:hidden',
                visible ? 'translate-y-0' : 'translate-y-full',
                className,
            )}
            aria-hidden={!visible}
        >
            <div className="mx-auto flex max-w-[90rem] items-center gap-3">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-body-strong text-ink">
                        {productName}
                    </p>
                    <p className="text-caption-md text-ink">
                        {formatCurrency(price, locale)}
                    </p>
                </div>
                <AddToBagButton
                    disabled={disabled}
                    onClick={onAddToBag}
                    className="shrink-0 px-6"
                />
            </div>
        </div>
    );
}

export { PdpStickyMobileBar };
