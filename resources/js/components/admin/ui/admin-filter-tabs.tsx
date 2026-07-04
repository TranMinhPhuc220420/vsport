import * as React from 'react';

import { cn } from '@/lib/utils';

type AdminFilterTabsProps = {
    value: string | null;
    onChange: (value: string | null) => void;
    options: { value: string | null; label: string }[];
    className?: string;
    disabled?: boolean;
};

function AdminFilterTabs({
    value,
    onChange,
    options,
    className,
    disabled,
}: AdminFilterTabsProps) {
    return (
        <div
            className={cn(
                'rounded-admin-md border-admin inline-flex flex-wrap gap-1 border bg-[var(--admin-neutral)] p-1',
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
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'rounded-admin-sm border border-transparent px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
                            active
                                ? 'border-admin bg-[var(--admin-surface)] text-[var(--admin-primary)]'
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
