import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export function getStockStatus(
    totalStock: number,
    lowThreshold = 5,
): StockStatus {
    if (totalStock <= 0) {
        return 'out_of_stock';
    }

    if (totalStock < lowThreshold) {
        return 'low_stock';
    }

    return 'in_stock';
}

type AdminStockBadgeProps = {
    status: StockStatus;
    className?: string;
};

const dotStyles: Record<StockStatus, string> = {
    in_stock: 'bg-[var(--admin-success)]',
    low_stock: 'bg-[var(--admin-warning)]',
    out_of_stock: 'bg-[var(--admin-danger)]',
};

const badgeStyles: Record<StockStatus, string> = {
    in_stock: 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]',
    low_stock: 'bg-[var(--admin-warning-soft)] text-[var(--admin-warning)]',
    out_of_stock: 'bg-[var(--admin-danger-soft)] text-[var(--admin-danger)]',
};

export function AdminStockBadge({ status, className }: AdminStockBadgeProps) {
    const { t } = useTranslation('admin');

    const labels: Record<StockStatus, string> = {
        in_stock: t('products.stockInStock'),
        low_stock: t('products.stockLow'),
        out_of_stock: t('products.stockOut'),
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                badgeStyles[status],
                className,
            )}
        >
            <span className={cn('size-1.5 rounded-full', dotStyles[status])} />
            {labels[status]}
        </span>
    );
}

type AdminActiveBadgeProps = {
    active: boolean;
    className?: string;
};

export function AdminActiveBadge({ active, className }: AdminActiveBadgeProps) {
    const { t } = useTranslation('admin');

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                active
                    ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
                    : 'text-admin-secondary bg-[var(--admin-neutral)]',
                className,
            )}
        >
            <span
                className={cn(
                    'size-1.5 rounded-full',
                    active
                        ? 'bg-[var(--admin-success)]'
                        : 'bg-[var(--admin-secondary)]',
                )}
            />
            {active ? t('products.active') : t('products.inactive')}
        </span>
    );
}
