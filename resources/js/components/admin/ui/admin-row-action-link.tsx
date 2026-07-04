import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type AdminRowActionLinkVariant = 'default' | 'danger';

const variantClassName: Record<AdminRowActionLinkVariant, string> = {
    default: 'text-admin-secondary hover:text-[var(--admin-primary)]',
    danger: 'text-[var(--admin-danger)] hover:text-[var(--admin-danger-hover)]',
};

type AdminRowActionLinkProps = {
    variant?: AdminRowActionLinkVariant;
    className?: string;
    disabled?: boolean;
    children: ReactNode;
} & (
    | { href: string; onClick?: undefined }
    | { href?: undefined; onClick: () => void }
);

function AdminRowActionLink({
    variant = 'default',
    className,
    disabled = false,
    children,
    ...props
}: AdminRowActionLinkProps) {
    const linkClassName = cn(
        'text-sm hover:underline disabled:pointer-events-none disabled:opacity-40',
        variantClassName[variant],
        className,
    );

    if (props.href) {
        return (
            <Link href={props.href} className={linkClassName}>
                {children}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={props.onClick}
            disabled={disabled}
            className={linkClassName}
        >
            {children}
        </button>
    );
}

export { AdminRowActionLink };
