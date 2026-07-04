import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

type AdminBulkActionBarProps = {
    selectedCount: number;
    onClear: () => void;
    actions: ReactNode;
    className?: string;
};

function AdminBulkActionBar({
    selectedCount,
    onClear,
    actions,
    className,
}: AdminBulkActionBarProps) {
    const { t } = useTranslation('admin');

    if (selectedCount === 0) {
        return null;
    }

    return (
        <div
            className={cn(
                'rounded-admin-md border-admin flex flex-wrap items-center gap-3 border bg-[var(--admin-surface)] px-4 py-3',
                className,
            )}
        >
            <span className="admin-body-strong">
                {t('bulkActions.selectedCount', { count: selectedCount })}
            </span>
            <button
                type="button"
                onClick={onClear}
                className="text-admin-secondary text-sm hover:underline"
            >
                {t('bulkActions.clear')}
            </button>
            <div className="ml-auto flex flex-wrap items-center gap-2">
                {actions}
            </div>
        </div>
    );
}

export { AdminBulkActionBar };
