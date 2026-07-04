import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

export type AdminStatCardTrend = {
    direction: 'up' | 'down' | 'flat';
    value: string;
    label?: string;
};

type AdminStatCardProps = {
    label: string;
    value: ReactNode;
    trend?: AdminStatCardTrend;
    className?: string;
    asChild?: boolean;
    children?: ReactNode;
};

const trendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    flat: Minus,
} as const;

const trendColorClassName = {
    up: 'text-[var(--admin-success)]',
    down: 'text-[var(--admin-danger)]',
    flat: 'text-admin-secondary',
} as const;

function AdminStatCardTrendPill({ trend }: { trend: AdminStatCardTrend }) {
    const { t } = useTranslation('admin');
    const Icon = trendIcon[trend.direction];
    const srLabel =
        trend.label ??
        t(
            trend.direction === 'up'
                ? 'dashboard.trendUp'
                : trend.direction === 'down'
                  ? 'dashboard.trendDown'
                  : 'dashboard.trendFlat',
        );

    return (
        <span
            className={cn(
                'mt-1 inline-flex items-center gap-1 text-xs font-medium',
                trendColorClassName[trend.direction],
            )}
        >
            <Icon className="size-3.5" aria-hidden="true" />
            <span>{trend.value}</span>
            <span className="sr-only">{srLabel}</span>
        </span>
    );
}

function AdminStatCard({
    label,
    value,
    trend,
    className,
    children,
}: AdminStatCardProps) {
    return (
        <div
            className={cn(
                'rounded-admin-lg border-admin border bg-[var(--admin-surface)] p-5 transition-colors',
                className,
            )}
        >
            {children ?? (
                <>
                    <p className="admin-label">{label}</p>
                    <p className="mt-2 text-2xl font-medium text-[var(--admin-primary)]">
                        {value}
                    </p>
                    {trend && <AdminStatCardTrendPill trend={trend} />}
                </>
            )}
        </div>
    );
}

export { AdminStatCard };
