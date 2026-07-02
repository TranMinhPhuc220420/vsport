import * as React from 'react';

import { cn } from '@/lib/utils';

type FilterChipProps = React.ComponentProps<'button'> & {
    active?: boolean;
};

function FilterChip({
    className,
    active = false,
    children,
    ...props
}: FilterChipProps) {
    return (
        <button
            type="button"
            data-slot="filter-chip"
            data-active={active || undefined}
            className={cn(
                'text-button-md inline-flex h-10 items-center justify-center rounded-pill-lg border px-4 transition-colors',
                active
                    ? 'border-ink bg-ink text-canvas'
                    : 'border-hairline bg-canvas text-ink',
                className,
            )}
            aria-pressed={active}
            {...props}
        >
            {children}
        </button>
    );
}

export { FilterChip };
