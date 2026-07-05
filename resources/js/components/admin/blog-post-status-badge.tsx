import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

export type BlogPostStatus = 'draft' | 'published';

type BlogPostStatusBadgeProps = {
    status: BlogPostStatus;
    isFeatured?: boolean;
    className?: string;
};

export function BlogPostStatusBadge({
    status,
    isFeatured = false,
    className,
}: BlogPostStatusBadgeProps) {
    const { t } = useTranslation('admin');

    return (
        <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
            <span
                className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                    status === 'published'
                        ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
                        : 'text-admin-secondary bg-[var(--admin-neutral)]',
                )}
            >
                <span
                    className={cn(
                        'size-1.5 rounded-full',
                        status === 'published'
                            ? 'bg-[var(--admin-success)]'
                            : 'bg-[var(--admin-secondary)]',
                    )}
                />
                {status === 'published'
                    ? t('blogPosts.published')
                    : t('blogPosts.draft')}
            </span>
            {isFeatured && (
                <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
                    {t('blogPosts.featuredBadge')}
                </span>
            )}
        </div>
    );
}
