import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

type SectionHeaderProps = {
    title: string;
    href?: string;
    viewAllLabel?: string;
    className?: string;
};

function SectionHeader({
    title,
    href,
    viewAllLabel,
    className,
}: SectionHeaderProps) {
    const { t } = useTranslation('storefront');

    return (
        <div
            data-slot="section-header"
            className={cn(
                'flex items-baseline justify-between gap-4',
                className,
            )}
        >
            <h2 className="text-heading-xl text-ink">{title}</h2>
            {href ? (
                <Link
                    href={href}
                    className="text-caption-md text-ink underline"
                >
                    {viewAllLabel ?? t('home.viewAll')}
                </Link>
            ) : null}
        </div>
    );
}

export { SectionHeader };
