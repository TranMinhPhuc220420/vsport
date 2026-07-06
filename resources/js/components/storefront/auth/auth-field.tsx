import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AuthFieldProps = {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
    className?: string;
    labelAction?: ReactNode;
};

function AuthField({
    id,
    label,
    error,
    children,
    className,
    labelAction,
}: AuthFieldProps) {
    const errorId = error ? `${id}-error` : undefined;

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between gap-3">
                <label htmlFor={id} className="text-caption-md text-mute">
                    {label}
                </label>
                {labelAction}
            </div>
            {children}
            {error && (
                <p
                    id={errorId}
                    role="alert"
                    className="text-caption-sm text-sale"
                >
                    {error}
                </p>
            )}
        </div>
    );
}

export { AuthField };
