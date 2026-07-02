import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type CheckoutFieldProps = {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
    className?: string;
};

function CheckoutField({
    id,
    label,
    error,
    children,
    className,
}: CheckoutFieldProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <label htmlFor={id} className="text-caption-md text-mute">
                {label}
            </label>
            {children}
            {error && <p className="text-caption-sm text-sale">{error}</p>}
        </div>
    );
}

const checkoutInputClassName =
    'w-full rounded-pill-md border border-hairline bg-canvas px-4 py-3 text-body-strong text-ink outline-none focus:ring-2 focus:ring-ink';

export { CheckoutField, checkoutInputClassName };
