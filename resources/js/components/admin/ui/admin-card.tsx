import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AdminCardProps = {
    children: ReactNode;
    className?: string;
};

function AdminCard({ children, className }: AdminCardProps) {
    return (
        <div
            className={cn(
                'rounded-admin-lg border border-admin bg-[var(--admin-surface)] p-6',
                className,
            )}
        >
            {children}
        </div>
    );
}

export { AdminCard };
