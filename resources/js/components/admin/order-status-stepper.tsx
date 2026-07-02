import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

const pipeline = [
    'pending',
    'confirmed',
    'shipping',
    'delivered',
    'completed',
] as const;

type OrderStatusStepperProps = {
    currentStatus: string;
};

function orderStatusKey(status: string): string {
    return `orders.status.${status}`;
}

export function OrderStatusStepper({ currentStatus }: OrderStatusStepperProps) {
    const { t } = useTranslation('admin');
    const isCancelled = currentStatus === 'cancelled';
    const currentIndex = pipeline.indexOf(
        currentStatus as (typeof pipeline)[number],
    );

    if (isCancelled) {
        return (
            <div className="rounded-admin-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {t(orderStatusKey('cancelled'))}
            </div>
        );
    }

    return (
        <ol className="flex flex-wrap gap-2">
            {pipeline.map((status, index) => {
                const isComplete = currentIndex > index;
                const isCurrent = currentIndex === index;

                return (
                    <li
                        key={status}
                        className={cn(
                            'rounded-admin-md border-admin flex items-center gap-2 border px-3 py-2 text-sm',
                            isComplete &&
                                'text-admin-secondary bg-[var(--admin-neutral)]',
                            isCurrent &&
                                'border-[var(--admin-primary)] bg-[var(--admin-primary)] font-medium text-[var(--admin-on-primary)]',
                            !isComplete &&
                                !isCurrent &&
                                'text-admin-secondary bg-[var(--admin-surface)]',
                        )}
                    >
                        <span
                            className={cn(
                                'flex size-5 items-center justify-center rounded-full text-xs',
                                isComplete &&
                                    'bg-[var(--admin-primary)] text-[var(--admin-on-primary)]',
                                isCurrent &&
                                    'bg-[var(--admin-on-primary)] text-[var(--admin-primary)]',
                                !isComplete &&
                                    !isCurrent &&
                                    'border-admin border',
                            )}
                        >
                            {index + 1}
                        </span>
                        {t(orderStatusKey(status), { defaultValue: status })}
                    </li>
                );
            })}
        </ol>
    );
}
