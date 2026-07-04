import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/utils';

type ProductRailProps = {
    children: ReactNode;
    className?: string;
};

function ProductRail({ children, className }: ProductRailProps) {
    return (
        <div
            data-slot="product-rail"
            className={cn(
                '-mx-4 overflow-x-auto scroll-ps-4 scroll-pe-4 scrollbar-none pb-2 tablet:mx-0 tablet:scroll-ps-0 tablet:scroll-pe-0',
                className,
            )}
        >
            <div className="flex w-max snap-x snap-mandatory gap-2 px-4 tablet:px-0">
                {children}
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
            className={cn(
                'w-[72vw] shrink-0 snap-start tablet:w-[45vw] desktop:w-[calc(25%-6px)]',
                className,
            )}
            style={{ '--stagger-index': index } as CSSProperties}
        >
            {children}
        </div>
    );
}

export { ProductRail, ProductRailItem };
