import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/types/catalog';

type AdminPaginationProps = {
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: PaginationMeta;
    className?: string;
};

function AdminPagination({ links, meta, className }: AdminPaginationProps) {
    const { t } = useTranslation('common');
    const linkItems = meta.links ?? [];

    if (meta.last_page <= 1) {
        return null;
    }

    const navButtonClass =
        'admin-body-strong inline-flex h-9 items-center rounded-admin-md border border-admin bg-[var(--admin-surface)] px-3 hover:bg-[var(--admin-neutral)]';

    return (
        <nav
            aria-label={t('pagination')}
            className={cn(
                'flex items-center justify-center gap-2 py-6',
                className,
            )}
        >
            {links.prev ? (
                <Link
                    href={links.prev}
                    preserveScroll
                    className={navButtonClass}
                >
                    {t('previous')}
                </Link>
            ) : (
                <span
                    className={cn(
                        navButtonClass,
                        'text-admin-secondary opacity-50',
                    )}
                >
                    {t('previous')}
                </span>
            )}

            <div className="hidden items-center gap-1 tablet:flex">
                {linkItems
                    .filter((link) => link.label.match(/^\d+$/))
                    .map((link) =>
                        link.url ? (
                            <Link
                                key={link.label}
                                href={link.url}
                                preserveScroll
                                className={cn(
                                    'rounded-admin-sm inline-flex size-9 items-center justify-center text-sm font-medium',
                                    link.active
                                        ? 'bg-[var(--admin-primary)] text-[var(--admin-on-primary)]'
                                        : 'text-[var(--admin-primary)] hover:bg-[var(--admin-neutral)]',
                                )}
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <span
                                key={link.label}
                                className="text-admin-secondary inline-flex size-9 items-center justify-center"
                            >
                                {link.label}
                            </span>
                        ),
                    )}
            </div>

            <span className="admin-caption tablet:hidden">
                {t('pageOf', {
                    current: meta.current_page,
                    last: meta.last_page,
                })}
            </span>

            {links.next ? (
                <Link
                    href={links.next}
                    preserveScroll
                    className={navButtonClass}
                >
                    {t('next')}
                </Link>
            ) : (
                <span
                    className={cn(
                        navButtonClass,
                        'text-admin-secondary opacity-50',
                    )}
                >
                    {t('next')}
                </span>
            )}
        </nav>
    );
}

export { AdminPagination };
