import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const storefrontBadgeVariants = cva(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap',
    {
        variants: {
            variant: {
                promo: 'text-caption-sm rounded-pill-lg border border-hairline bg-canvas px-3 py-1 text-ink',
                sale: 'text-caption-md text-sale',
            },
        },
        defaultVariants: {
            variant: 'promo',
        },
    },
);

function StorefrontBadge({
    className,
    variant,
    asChild = false,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof storefrontBadgeVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'span';

    return (
        <Comp
            data-slot="storefront-badge"
            className={cn(storefrontBadgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { StorefrontBadge, storefrontBadgeVariants };
