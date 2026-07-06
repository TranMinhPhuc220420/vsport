import { Check } from 'lucide-react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type AuthCheckboxProps = Omit<ComponentProps<'input'>, 'type'> & {
    label: string;
};

function AuthCheckbox({
    id,
    label,
    className,
    ...props
}: AuthCheckboxProps) {
    return (
        <label
            htmlFor={id}
            className={cn(
                'flex cursor-pointer items-center gap-3 text-body-strong text-ink',
                className,
            )}
        >
            <span className="relative flex size-5 shrink-0 items-center justify-center">
                <input
                    id={id}
                    type="checkbox"
                    className="peer sr-only"
                    {...props}
                />
                <span className="size-5 rounded-sm border border-hairline bg-canvas transition-colors peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
                <Check
                    className="pointer-events-none absolute size-3 text-canvas opacity-0 transition-opacity peer-checked:opacity-100"
                    aria-hidden
                />
            </span>
            <span className="text-caption-md">{label}</span>
        </label>
    );
}

export { AuthCheckbox };
