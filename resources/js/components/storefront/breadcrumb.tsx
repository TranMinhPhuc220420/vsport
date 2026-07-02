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
};

function Breadcrumb({ items, className }: BreadcrumbProps) {
    const { t } = useTranslation('storefront');

    return (
        <nav
            data-slot="breadcrumb"
            aria-label={t('plp.breadcrumb')}
            className={cn('text-caption-md text-mute', className)}
        >
            <ol className="flex flex-wrap items-center gap-1">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li
                            key={`${item.label}-${index}`}
                            className="flex items-center gap-1"
                        >
                            {index > 0 && (
                                <span aria-hidden className="text-stone">
                                    /
                                </span>
                            )}
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className="text-mute hover:text-ink hover:underline"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={cn(
                                        isLast ? 'text-ink' : 'text-mute',
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
