import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AdminStatCardProps = {
    label: string;
    value: ReactNode;
    className?: string;
    asChild?: boolean;
    children?: ReactNode;
};

function AdminStatCard({
    label,
    value,
    className,
    children,
}: AdminStatCardProps) {
    return (
        <div
            className={cn(
                'rounded-admin-lg border border-admin bg-[var(--admin-surface)] p-5 transition-colors',
                className,
            )}
        >
            {children ?? (
                <>
                    <p className="admin-label">{label}</p>
                    <p className="mt-2 text-2xl font-medium text-[var(--admin-primary)]">
                        {value}
                    </p>
                </>
            )}
        </div>
    );
}

export { AdminStatCard };
