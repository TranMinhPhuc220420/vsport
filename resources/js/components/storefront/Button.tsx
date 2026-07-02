import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const storefrontButtonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-button-md transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0',
    {
        variants: {
            variant: {
                primary:
                    'bg-ink text-canvas rounded-pill-lg h-12 px-8 active:scale-95 active:opacity-50',
                secondary:
                    'bg-soft-cloud text-ink rounded-pill-lg h-12 px-8 active:scale-95 active:opacity-50',
                'outline-on-image':
                    'bg-canvas text-ink rounded-pill-lg px-6 py-3 active:scale-95 active:opacity-50',
                icon: 'bg-soft-cloud text-ink rounded-full size-10 active:scale-95 active:opacity-50',
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
