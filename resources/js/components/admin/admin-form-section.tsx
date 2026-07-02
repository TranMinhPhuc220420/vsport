import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AdminFormSectionProps = {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    actions?: ReactNode;
};

export function AdminFormSection({
    title,
    description,
    children,
    className,
    actions,
}: AdminFormSectionProps) {
    return (
        <section
            className={cn(
                'rounded-admin-lg border-admin space-y-4 border bg-[var(--admin-surface)] p-6',
                className,
            )}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="admin-section-title">{title}</h2>
                    {description && (
                        <p className="admin-caption mt-1">{description}</p>
                    )}
                </div>
                {actions}
            </div>
            {children}
        </section>
    );
}
