import { Link } from '@inertiajs/react';
import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

type AuthTextLinkProps = ComponentProps<typeof Link>;

function AuthTextLink({ className, children, ...props }: AuthTextLinkProps) {
    return (
        <Link
            className={cn(
                'text-caption-md text-mute underline decoration-hairline underline-offset-4 transition-colors hover:text-ink hover:decoration-ink',
                className,
            )}
            {...props}
        >
            {children}
        </Link>
    );
}

export { AuthTextLink };
