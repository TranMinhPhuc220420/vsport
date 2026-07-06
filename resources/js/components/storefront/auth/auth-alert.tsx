import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AuthAlertProps = {
    variant?: 'success' | 'error' | 'info';
    children: ReactNode;
    className?: string;
};

function AuthAlert({ variant = 'info', children, className }: AuthAlertProps) {
    return (
        <div
            role="alert"
            className={cn(
                'text-caption-md rounded-pill-md border px-4 py-3',
                variant === 'success' &&
                    'border-success/30 bg-success/5 text-success',
                variant === 'error' && 'border-sale/30 bg-sale/5 text-sale',
                variant === 'info' && 'border-hairline bg-soft-cloud text-ink',
                className,
            )}
        >
            {children}
        </div>
    );
}

export { AuthAlert };
