import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const adminButtonVariants = cva(
    'admin-body-strong rounded-admin-md inline-flex h-9 items-center justify-center gap-2 px-4 whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--admin-tertiary)_40%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--admin-surface)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
    {
        variants: {
            variant: {
                primary:
                    'bg-[var(--admin-tertiary)] text-[var(--admin-on-tertiary)] hover:bg-[var(--admin-tertiary-hover)]',
                secondary:
                    'border-admin border bg-[var(--admin-surface)] text-[var(--admin-primary)] hover:bg-[var(--admin-neutral)]',
                ghost: 'text-[var(--admin-primary)] hover:bg-[var(--admin-neutral)]',
                destructive:
                    'bg-[var(--admin-danger)] text-[var(--admin-on-destructive)] hover:bg-[var(--admin-danger-hover)]',
            },
            size: {
                default: '',
                sm: 'h-8 px-3 text-xs',
                lg: 'h-10 px-5',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    },
);

function adminActionButtonClass(
    variant: NonNullable<VariantProps<typeof adminButtonVariants>['variant']>,
    size: NonNullable<
        VariantProps<typeof adminButtonVariants>['size']
    > = 'default',
) {
    return adminButtonVariants({ variant, size });
}

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

export { AdminButton, adminActionButtonClass, adminButtonVariants };
