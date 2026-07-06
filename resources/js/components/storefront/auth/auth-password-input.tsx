import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps, Ref } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

import { authInputClassName } from './auth-input';

type AuthPasswordInputProps = Omit<ComponentProps<'input'>, 'type'> & {
    ref?: Ref<HTMLInputElement>;
    error?: string;
};

function AuthPasswordInput({
    className,
    error,
    ref,
    'aria-describedby': ariaDescribedBy,
    ...props
}: AuthPasswordInputProps) {
    const { t } = useTranslation('common');
    const [showPassword, setShowPassword] = useState(false);
    const errorId = error && props.id ? `${props.id}-error` : undefined;

    return (
        <div className="relative">
            <input
                type={showPassword ? 'text' : 'password'}
                className={cn(
                    authInputClassName,
                    'pr-12',
                    error && 'border-sale focus:ring-sale',
                    className,
                )}
                ref={ref}
                aria-invalid={error ? true : undefined}
                aria-describedby={
                    [ariaDescribedBy, errorId].filter(Boolean).join(' ') ||
                    undefined
                }
                {...props}
            />
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center rounded-r-pill-md px-4 text-mute transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                aria-label={
                    showPassword ? t('hidePassword') : t('showPassword')
                }
                tabIndex={-1}
            >
                {showPassword ? (
                    <EyeOff className="size-4" />
                ) : (
                    <Eye className="size-4" />
                )}
            </button>
        </div>
    );
}

export { AuthPasswordInput };
