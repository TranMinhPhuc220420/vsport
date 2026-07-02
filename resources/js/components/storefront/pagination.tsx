import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/types/catalog';

type StorefrontPaginationProps = {
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: PaginationMeta;
    className?: string;
};

function StorefrontPagination({
    links,
    meta,
    className,
}: StorefrontPaginationProps) {
    const { t } = useTranslation('common');
    const linkItems = meta.links ?? [];

    if (meta.last_page <= 1) {
        return null;
    }

    return (
        <nav
            aria-label={t('pagination')}
            className={cn(
                'flex items-center justify-center gap-2 py-8',
                className,
            )}
        >
            {links.prev ? (
                <Link
                    href={links.prev}
                    preserveScroll
                    className="text-button-md inline-flex h-10 items-center rounded-pill-lg border border-hairline px-4"
                >
                    {t('previous')}
                </Link>
            ) : (
                <span className="text-button-md inline-flex h-10 items-center rounded-pill-lg border border-hairline px-4 text-mute opacity-50">
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
                                    'text-button-md inline-flex size-10 items-center justify-center rounded-full',
                                    link.active
                                        ? 'bg-ink text-canvas'
                                        : 'text-ink',
                                )}
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <span
                                key={link.label}
                                className="inline-flex size-10 items-center justify-center text-mute"
                            >
                                {link.label}
                            </span>
                        ),
                    )}
            </div>

            <span className="text-caption-md text-mute tablet:hidden">
                {t('pageOf', {
                    current: meta.current_page,
                    last: meta.last_page,
                })}
            </span>

            {links.next ? (
                <Link
                    href={links.next}
                    preserveScroll
                    className="text-button-md inline-flex h-10 items-center rounded-pill-lg border border-hairline px-4"
                >
                    {t('next')}
                </Link>
            ) : (
                <span className="text-button-md inline-flex h-10 items-center rounded-pill-lg border border-hairline px-4 text-mute opacity-50">
                    {t('next')}
                </span>
            )}
        </nav>
    );
}

export { StorefrontPagination };
