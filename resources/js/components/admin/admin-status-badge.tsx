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

export function AdminStockBadge({ status, className }: AdminStockBadgeProps) {
    const { t } = useTranslation('admin');

    const styles: Record<StockStatus, string> = {
        in_stock: 'border-green-200 bg-green-50 text-green-800',
        low_stock: 'border-amber-200 bg-amber-50 text-amber-800',
        out_of_stock: 'border-red-200 bg-red-50 text-red-800',
    };

    const labels: Record<StockStatus, string> = {
        in_stock: t('products.stockInStock'),
        low_stock: t('products.stockLow'),
        out_of_stock: t('products.stockOut'),
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                styles[status],
                className,
            )}
        >
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
                'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                active
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-admin text-admin-secondary bg-[var(--admin-neutral)]',
                className,
            )}
        >
            {active ? t('products.active') : t('products.inactive')}
        </span>
    );
}
