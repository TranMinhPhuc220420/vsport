import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const adminButtonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap admin-body-strong transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:shrink-0 rounded-admin-md focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--admin-tertiary)_40%,transparent)] focus-visible:ring-offset-2',
    {
        variants: {
            variant: {
                primary:
                    'bg-[var(--admin-tertiary)] text-[var(--admin-on-primary)] hover:bg-[var(--admin-tertiary-hover)] py-3 px-5',
                secondary:
                    'bg-[var(--admin-surface)] text-[var(--admin-primary)] border border-admin hover:bg-[var(--admin-neutral)] h-9 px-3.5',
                ghost: 'text-[var(--admin-primary)] hover:bg-[var(--admin-neutral)] h-9 px-3',
                destructive:
                    'bg-[var(--admin-danger)] text-white hover:bg-red-700 h-9 px-3.5',
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
