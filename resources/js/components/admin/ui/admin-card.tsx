import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type AdminCardProps = ComponentProps<'div'>;

function AdminCard({ className, ...props }: AdminCardProps) {
    return (
        <div
            className={cn(
                'rounded-admin-lg border-admin border bg-[var(--admin-surface)] p-6',
                className,
            )}
            {...props}
        />
    );
}

export { AdminCard };
