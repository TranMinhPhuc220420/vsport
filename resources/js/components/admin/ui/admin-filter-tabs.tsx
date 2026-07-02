import * as React from 'react';

import { cn } from '@/lib/utils';

type AdminFilterTabsProps = {
    value: string | null;
    onChange: (value: string | null) => void;
    options: { value: string | null; label: string }[];
    className?: string;
};

function AdminFilterTabs({
    value,
    onChange,
    options,
    className,
}: AdminFilterTabsProps) {
    return (
        <div
            className={cn(
                'inline-flex flex-wrap gap-1 rounded-admin-md border border-admin bg-[var(--admin-neutral)] p-1',
                className,
            )}
            role="tablist"
        >
            {options.map((option) => {
                const active = value === option.value;

                return (
                    <button
                        key={option.label}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'rounded-admin-sm px-3 py-1.5 text-sm font-medium transition-colors',
                            active
                                ? 'bg-[var(--admin-surface)] text-[var(--admin-primary)] shadow-sm'
                                : 'text-admin-secondary hover:text-[var(--admin-primary)]',
                        )}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}

export { AdminFilterTabs };
