import type { ReactNode } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import { AdminCard } from './admin-card';

type AdminCardListProps = {
    children: ReactNode;
    className?: string;
};

function AdminCardList({ children, className }: AdminCardListProps) {
    return <div className={cn('space-y-3', className)}>{children}</div>;
}

type AdminCardListItemProps = {
    title: ReactNode;
    subtitle?: ReactNode;
    badge?: ReactNode;
    leading?: ReactNode;
    onClick?: () => void;
    actions?: ReactNode;
    children?: ReactNode;
    className?: string;
};

function AdminCardListItem({
    title,
    subtitle,
    badge,
    leading,
    onClick,
    actions,
    children,
    className,
}: AdminCardListItemProps) {
    return (
        <AdminCard
            onClick={onClick}
            className={cn(
                'space-y-3',
                onClick &&
                    'cursor-pointer transition-colors hover:bg-[var(--admin-neutral)]',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                {leading && (
                    <div onClick={(e) => e.stopPropagation()}>{leading}</div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[var(--admin-primary)]">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="text-admin-secondary truncate text-sm">
                            {subtitle}
                        </p>
                    )}
                </div>
                {badge}
            </div>
            {children && <dl className="space-y-1.5 text-sm">{children}</dl>}
            {actions && (
                <div
                    className="border-admin flex justify-end gap-2 border-t pt-3"
                    onClick={(e) => e.stopPropagation()}
                >
                    {actions}
                </div>
            )}
        </AdminCard>
    );
}

function AdminCardListField({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-3">
            <dt className="admin-label">{label}</dt>
            <dd className="text-admin-secondary truncate text-right">
                {children}
            </dd>
        </div>
    );
}

function AdminSkeletonCards({ count = 4 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <AdminCard key={index} className="space-y-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                </AdminCard>
            ))}
        </>
    );
}

export {
    AdminCardList,
    AdminCardListField,
    AdminCardListItem,
    AdminSkeletonCards,
};
