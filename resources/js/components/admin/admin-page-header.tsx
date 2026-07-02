import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AdminPageHeaderProps = {
    backHref?: string;
    backLabel?: string;
    title: string;
    subtitle?: ReactNode;
    badges?: ReactNode;
    actions?: ReactNode;
    className?: string;
    sticky?: boolean;
};

export function AdminPageHeader({
    backHref,
    backLabel,
    title,
    subtitle,
    badges,
    actions,
    className,
    sticky = false,
}: AdminPageHeaderProps) {
    return (
        <header
            className={cn(
                'space-y-3',
                sticky &&
                    'sticky top-0 z-10 -mx-6 border-b border-admin bg-admin-canvas px-6 py-4',
                className,
            )}
        >
            {backHref && backLabel && (
                <Link
                    href={backHref}
                    className="admin-caption hover:text-[var(--admin-primary)] hover:underline"
                >
                    {backLabel}
                </Link>
            )}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="admin-title">{title}</h1>
                    {subtitle && (
                        <p className="admin-caption mt-1">{subtitle}</p>
                    )}
                    {badges && (
                        <div className="mt-3 flex flex-wrap gap-2">{badges}</div>
                    )}
                </div>
                {actions && (
                    <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
                )}
            </div>
        </header>
    );
}
