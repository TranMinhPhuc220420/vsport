import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const storefrontBadgeVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap shrink-0',
    {
        variants: {
            variant: {
                promo: 'bg-canvas border border-hairline text-ink text-caption-sm rounded-pill-lg px-3 py-1',
                sale: 'text-sale text-caption-md',
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
