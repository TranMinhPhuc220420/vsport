import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const adminButtonVariants = cva(
    'admin-body-strong rounded-admin-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--admin-tertiary)_40%,transparent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
    {
        variants: {
            variant: {
                primary:
                    'bg-[var(--admin-tertiary)] px-5 py-3 text-[var(--admin-on-primary)] hover:bg-[var(--admin-tertiary-hover)]',
                secondary:
                    'border-admin h-9 border bg-[var(--admin-surface)] px-3.5 text-[var(--admin-primary)] hover:bg-[var(--admin-neutral)]',
                ghost: 'h-9 px-3 text-[var(--admin-primary)] hover:bg-[var(--admin-neutral)]',
                destructive:
                    'h-9 bg-[var(--admin-danger)] px-3.5 text-white hover:bg-red-700',
            },
            size: {
                default: '',
                sm: 'h-8 px-2.5 text-xs',
                lg: 'h-10 px-4',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    },
);

function AdminButton({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof adminButtonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="admin-button"
            className={cn(adminButtonVariants({ variant, size }), className)}
            {...props}
        />
    );
}

export { AdminButton, adminButtonVariants };
