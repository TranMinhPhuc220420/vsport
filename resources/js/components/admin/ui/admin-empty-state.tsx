import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AdminEmptyStateProps = {
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
};

function AdminEmptyState({
    title,
    description,
    action,
    className,
}: AdminEmptyStateProps) {
    return (
        <div
            className={cn(
                'rounded-admin-lg border-admin border border-dashed bg-[var(--admin-neutral)] px-6 py-12 text-center',
                className,
            )}
        >
            <p className="admin-section-title">{title}</p>
            {description && <p className="admin-caption mt-2">{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export { AdminEmptyState };
