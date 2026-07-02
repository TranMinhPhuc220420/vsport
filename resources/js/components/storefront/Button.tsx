import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const storefrontButtonVariants = cva(
    'text-button-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
    {
        variants: {
            variant: {
                primary:
                    'h-12 rounded-pill-lg bg-ink px-8 text-canvas active:scale-95 active:opacity-50',
                secondary:
                    'h-12 rounded-pill-lg bg-soft-cloud px-8 text-ink active:scale-95 active:opacity-50',
                'outline-on-image':
                    'rounded-pill-lg bg-canvas px-6 py-3 text-ink active:scale-95 active:opacity-50',
                icon: 'size-10 rounded-full bg-soft-cloud text-ink active:scale-95 active:opacity-50',
            },
            size: {
                default: '',
                sm: 'h-10 px-6 text-sm',
                lg: 'h-12 px-8',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    },
);

function StorefrontButton({
    className,
    variant,
    size,
    asChild = false,
    active = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof storefrontButtonVariants> & {
        asChild?: boolean;
        active?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="storefront-button"
            data-active={active || undefined}
            className={cn(
                storefrontButtonVariants({ variant, size }),
                active && 'scale-95 opacity-50',
                className,
            )}
            {...props}
        />
    );
}

export { StorefrontButton, storefrontButtonVariants };
