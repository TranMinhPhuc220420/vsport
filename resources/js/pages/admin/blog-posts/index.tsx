import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminConfirmDialog } from '@/components/admin/admin-confirm-dialog';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import {
    BlogPostStatusBadge,
    type BlogPostStatus,
} from '@/components/admin/blog-post-status-badge';
import { AdminButton } from '@/components/admin/ui/admin-button';
import {
    AdminCardList,
    AdminCardListField,
    AdminCardListItem,
    AdminSkeletonCards,
} from '@/components/admin/ui/admin-card-list';
import {
    AdminDataTable,
    AdminDataTableBody,
    AdminDataTableCell,
    AdminDataTableHead,
    AdminDataTableHeaderCell,
    AdminDataTableHeaderRow,
    AdminDataTableRow,
} from '@/components/admin/ui/admin-data-table';
import { AdminEmptyState } from '@/components/admin/ui/admin-empty-state';
import { AdminFilterTabs } from '@/components/admin/ui/admin-filter-tabs';
import { AdminPagination } from '@/components/admin/ui/admin-pagination';
import { AdminRowActionLink } from '@/components/admin/ui/admin-row-action-link';
import { AdminSkeletonRows } from '@/components/admin/ui/admin-skeleton-rows';
import { useAdminFilterPending } from '@/hooks/use-admin-filter-pending';
import { formatDateTime, useLocale } from '@/hooks/use-locale';

type BlogPostRow = {
    id: number;
    title: string;
    slug: string;
    status: BlogPostStatus;
    isFeatured: boolean;
    publishedAt: string | null;
    updatedAt: string | null;
    categoryName: string | null;
    authorName: string;
    readingTimeMinutes: number;
    featuredImageUrl: string | null;
    featuredImageAlt: string | null;
};

type AdminBlogPostsIndexProps = {
    posts: {
        data: BlogPostRow[];
        links: {
            first: string | null;
            last: string | null;
            prev: string | null;
            next: string | null;
        };
        meta: {
            current_page: number;
            last_page: number;
            total: number;
        };
    };
    filters: {
        status: string;
    };
};

function BlogPostThumbnail({
    post,
    className,
}: {
    post: Pick<
        BlogPostRow,
        'featuredImageUrl' | 'featuredImageAlt' | 'title'
    >;
    className?: string;
}) {
    const { t: tCommon } = useTranslation('common');

    return (
        <div
            className={`border-admin flex h-14 w-[5.5rem] shrink-0 items-center justify-center overflow-hidden rounded-md border bg-[var(--admin-neutral)] ${className ?? ''}`}
        >
            {post.featuredImageUrl ? (
                <img
                    src={post.featuredImageUrl}
                    alt={post.featuredImageAlt ?? post.title}
                    className="size-full object-cover"
                />
            ) : (
                <span className="text-admin-secondary px-1 text-center text-xs">
                    {tCommon('noImage')}
                </span>
            )}
        </div>
    );
}

function BlogPostMetaLine({ post }: { post: BlogPostRow }) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');

    const parts = [
        post.categoryName,
        post.authorName,
        t('blogPosts.readingTime', { minutes: post.readingTimeMinutes }),
        `/blog/${post.slug}`,
    ].filter(Boolean);

    return (
        <p className="text-admin-secondary mt-1 text-xs">
            {parts.map((part, index) => (
                <span key={part}>
                    {index > 0 && (
                        <span aria-hidden="true" className="mx-1">
                            ·
                        </span>
                    )}
                    {part}
                </span>
            ))}
            {parts.length === 0 && tCommon('emDash')}
        </p>
    );
}

function BlogPostDateCell({
    post,
    locale,
}: {
    post: BlogPostRow;
    locale: string;
}) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');

    if (post.status === 'published' && post.publishedAt) {
        return (
            <span className="text-admin-secondary">
                {formatDateTime(post.publishedAt, locale)}
            </span>
        );
    }

    if (post.updatedAt) {
        return (
            <span className="text-admin-secondary">
                {t('blogPosts.updatedAt', {
                    date: formatDateTime(post.updatedAt, locale),
                })}
            </span>
        );
    }

    return <span className="text-admin-secondary">{tCommon('emDash')}</span>;
}

function BlogPostRowActions({
    post,
    onDelete,
}: {
    post: BlogPostRow;
    onDelete: () => void;
}) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');

    return (
        <div className="flex justify-end gap-2">
            <AdminRowActionLink
                href={`/admin/blog-posts/${post.slug}/edit`}
            >
                {tCommon('edit')}
            </AdminRowActionLink>
            {post.status === 'published' && (
                <AdminRowActionLink href={`/blog/${post.slug}`}>
                    {t('blogPosts.viewPost')}
                </AdminRowActionLink>
            )}
            <AdminRowActionLink variant="danger" onClick={onDelete}>
                {tCommon('delete')}
            </AdminRowActionLink>
        </div>
    );
}

export default function AdminBlogPostsIndex({
    posts,
    filters,
}: AdminBlogPostsIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { locale } = useLocale();
    const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
    const { isPending, onStart, onFinish } = useAdminFilterPending();

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.blogPosts'),
                href: '/admin/blog-posts',
            },
        ],
    });

    const filterOptions = [
        { value: 'all', label: t('blogPosts.statusFilter.all') },
        { value: 'draft', label: t('blogPosts.statusFilter.draft') },
        { value: 'published', label: t('blogPosts.statusFilter.published') },
    ];

    const destroy = () => {
        if (deleteSlug === null) {
            return;
        }

        router.delete(`/admin/blog-posts/${deleteSlug}`, {
            onFinish: () => setDeleteSlug(null),
        });
    };

    const applyStatusFilter = (status: string | null) => {
        if (status === null) {
            return;
        }

        router.get(
            '/admin/blog-posts',
            { status: status === 'all' ? undefined : status },
            { preserveState: true, onStart, onFinish },
        );
    };

    const visitEdit = (slug: string) => {
        router.visit(`/admin/blog-posts/${slug}/edit`);
    };

    const emptyMessage = t('blogPosts.emptyDescription');

    return (
        <>
            <Head title={t('blogPosts.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('blogPosts.title')}
                    subtitle={t('blogPosts.description')}
                    actions={
                        <AdminButton asChild>
                            <Link href="/admin/blog-posts/create">
                                {t('blogPosts.new')}
                            </Link>
                        </AdminButton>
                    }
                />

                <AdminFilterTabs
                    value={filters.status}
                    onChange={applyStatusFilter}
                    options={filterOptions}
                    disabled={isPending}
                />

                {!isPending && posts.data.length === 0 ? (
                    <AdminEmptyState
                        title={t('blogPosts.emptyTitle')}
                        description={emptyMessage}
                        action={
                            <AdminButton asChild variant="secondary">
                                <Link href="/admin/blog-posts/create">
                                    {t('blogPosts.new')}
                                </Link>
                            </AdminButton>
                        }
                    />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <AdminDataTable minWidth="720px">
                                <AdminDataTableHead>
                                    <AdminDataTableHeaderRow>
                                        <AdminDataTableHeaderCell>
                                            {t('blogPosts.postColumn')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {tCommon('status')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('blogPosts.publishedAt')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell align="right">
                                            {tCommon('actions')}
                                        </AdminDataTableHeaderCell>
                                    </AdminDataTableHeaderRow>
                                </AdminDataTableHead>
                                <AdminDataTableBody>
                                    {isPending ? (
                                        <AdminSkeletonRows columns={4} />
                                    ) : (
                                        posts.data.map((post) => (
                                            <AdminDataTableRow
                                                key={post.id}
                                                className="align-top"
                                                onClick={() =>
                                                    visitEdit(post.slug)
                                                }
                                            >
                                                <AdminDataTableCell>
                                                    <div className="flex items-start gap-3">
                                                        <BlogPostThumbnail
                                                            post={post}
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-[var(--admin-primary)]">
                                                                {post.title}
                                                            </p>
                                                            <BlogPostMetaLine
                                                                post={post}
                                                            />
                                                        </div>
                                                    </div>
                                                </AdminDataTableCell>
                                                <AdminDataTableCell>
                                                    <BlogPostStatusBadge
                                                        status={post.status}
                                                        isFeatured={
                                                            post.isFeatured
                                                        }
                                                    />
                                                </AdminDataTableCell>
                                                <AdminDataTableCell>
                                                    <BlogPostDateCell
                                                        post={post}
                                                        locale={locale}
                                                    />
                                                </AdminDataTableCell>
                                                <AdminDataTableCell align="right">
                                                    <div
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <BlogPostRowActions
                                                            post={post}
                                                            onDelete={() =>
                                                                setDeleteSlug(
                                                                    post.slug,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </AdminDataTableCell>
                                            </AdminDataTableRow>
                                        ))
                                    )}
                                </AdminDataTableBody>
                            </AdminDataTable>
                        </div>

                        <AdminCardList className="md:hidden">
                            {isPending ? (
                                <AdminSkeletonCards />
                            ) : (
                                posts.data.map((post) => (
                                    <AdminCardListItem
                                        key={post.id}
                                        title={post.title}
                                        badge={
                                            <BlogPostStatusBadge
                                                status={post.status}
                                                isFeatured={post.isFeatured}
                                            />
                                        }
                                        onClick={() => visitEdit(post.slug)}
                                        actions={
                                            <BlogPostRowActions
                                                post={post}
                                                onDelete={() =>
                                                    setDeleteSlug(post.slug)
                                                }
                                            />
                                        }
                                    >
                                        <div className="border-admin overflow-hidden rounded-md border">
                                            {post.featuredImageUrl ? (
                                                <img
                                                    src={
                                                        post.featuredImageUrl
                                                    }
                                                    alt={
                                                        post.featuredImageAlt ??
                                                        post.title
                                                    }
                                                    className="aspect-[16/10] w-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-admin-secondary flex aspect-[16/10] items-center justify-center bg-[var(--admin-neutral)] text-sm">
                                                    {tCommon('noImage')}
                                                </div>
                                            )}
                                        </div>
                                        <BlogPostMetaLine post={post} />
                                        <AdminCardListField
                                            label={t('blogPosts.publishedAt')}
                                        >
                                            <BlogPostDateCell
                                                post={post}
                                                locale={locale}
                                            />
                                        </AdminCardListField>
                                    </AdminCardListItem>
                                ))
                            )}
                        </AdminCardList>
                    </>
                )}

                <AdminPagination
                    links={posts.links}
                    meta={{
                        current_page: posts.meta.current_page,
                        from: null,
                        last_page: posts.meta.last_page,
                        per_page: 15,
                        to: null,
                        total: posts.meta.total,
                    }}
                />
            </div>

            <AdminConfirmDialog
                open={deleteSlug !== null}
                onOpenChange={(open) => !open && setDeleteSlug(null)}
                title={t('blogPosts.deleteConfirm')}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={destroy}
            />
        </>
    );
}
