import { Search } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type SearchPillProps = Omit<
    React.ComponentProps<'input'>,
    'className' | 'size'
> & {
    className?: string;
    containerClassName?: string;
};

function SearchPill({
    className,
    containerClassName,
    placeholder = 'Search',
    ...props
}: SearchPillProps) {
    return (
        <div
            data-slot="search-pill"
            className={cn(
                'group flex h-10 items-center gap-2 rounded-pill-md bg-soft-cloud px-4 transition-colors focus-within:bg-canvas focus-within:ring-4 focus-within:ring-soft-cloud',
                'focus-within:border-2 focus-within:border-ink',
                containerClassName,
            )}
        >
            <Search className="size-4 shrink-0 text-ink" aria-hidden />
            <input
                type="search"
                placeholder={placeholder}
                className={cn(
                    'min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-mute',
                    className,
                )}
                {...props}
            />
        </div>
    );
}

export { SearchPill };
