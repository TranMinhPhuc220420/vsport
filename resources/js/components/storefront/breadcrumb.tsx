import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbProps = {
    items: BreadcrumbItem[];
    className?: string;
    tone?: 'default' | 'inverse';
};

function Breadcrumb({ items, className, tone = 'default' }: BreadcrumbProps) {
    const { t } = useTranslation('storefront');
    const inverse = tone === 'inverse';

    return (
        <nav
            data-slot="breadcrumb"
            aria-label={t('plp.breadcrumb')}
            className={cn(
                'text-caption-md',
                inverse ? 'text-canvas/70' : 'text-mute',
                className,
            )}
        >
            <ol className="flex flex-wrap items-center gap-1">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li
                            key={`${item.label}-${index}`}
                            className="flex min-w-0 items-center gap-1"
                        >
                            {index > 0 && (
                                <span
                                    aria-hidden
                                    className={
                                        inverse ? 'text-canvas/50' : 'text-stone'
                                    }
                                >
                                    /
                                </span>
                            )}
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className={
                                        inverse
                                            ? 'text-canvas/70 hover:text-canvas hover:underline'
                                            : 'text-mute hover:text-ink hover:underline'
                                    }
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={cn(
                                        'line-clamp-1',
                                        inverse
                                            ? isLast
                                                ? 'text-canvas'
                                                : 'text-canvas/70'
                                            : isLast
                                              ? 'text-ink'
                                              : 'text-mute',
                                    )}
                                    aria-current={
                                        isLast ? 'page' : undefined
                                    }
                                >
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export { Breadcrumb };
export type { BreadcrumbItem };
