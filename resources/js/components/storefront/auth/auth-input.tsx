import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

export const authInputClassName =
    'w-full rounded-pill-md border border-hairline bg-canvas px-4 py-3 text-body-strong text-ink outline-none transition-shadow placeholder:text-stone focus:ring-2 focus:ring-ink disabled:cursor-not-allowed disabled:opacity-50';

type AuthInputProps = ComponentProps<'input'> & {
    error?: string;
};

function AuthInput({
    className,
    error,
    'aria-describedby': ariaDescribedBy,
    ...props
}: AuthInputProps) {
    const errorId = error && props.id ? `${props.id}-error` : undefined;

    return (
        <input
            className={cn(
                authInputClassName,
                error && 'border-sale focus:ring-sale',
                className,
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={
                [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined
            }
            {...props}
        />
    );
}

export { AuthInput };
