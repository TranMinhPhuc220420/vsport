import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminConfirmDialog } from '@/components/admin/admin-confirm-dialog';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
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
import { AdminRowActionLink } from '@/components/admin/ui/admin-row-action-link';

type BlogTagRow = {
    id: number;
    name: string;
    slug: string;
    postsCount: number;
};

type AdminBlogTagsIndexProps = {
    tags: {
        data: BlogTagRow[];
    };
};

export default function AdminBlogTagsIndex({ tags }: AdminBlogTagsIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.blogTags'),
                href: '/admin/blog-tags',
            },
        ],
    });

    const destroy = () => {
        if (deleteSlug === null) {
            return;
        }

        router.delete(`/admin/blog-tags/${deleteSlug}`, {
            onFinish: () => setDeleteSlug(null),
        });
    };

    return (
        <>
            <Head title={t('blogTags.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('blogTags.title')}
                    subtitle={t('blogTags.description')}
                    actions={
                        <AdminButton asChild>
                            <Link href="/admin/blog-tags/create">
                                {t('blogTags.new')}
                            </Link>
                        </AdminButton>
                    }
                />

                {tags.data.length === 0 ? (
                    <AdminEmptyState
                        title={t('blogTags.emptyTitle')}
                        description={t('blogTags.emptyDescription')}
                    />
                ) : (
                    <AdminDataTable>
                        <AdminDataTableHead>
                            <AdminDataTableHeaderRow>
                                <AdminDataTableHeaderCell>
                                    {t('blogTags.name')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {t('blogTags.slug')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell>
                                    {t('blogTags.postsCount')}
                                </AdminDataTableHeaderCell>
                                <AdminDataTableHeaderCell className="text-right">
                                    {tCommon('actions')}
                                </AdminDataTableHeaderCell>
                            </AdminDataTableHeaderRow>
                        </AdminDataTableHead>
                        <AdminDataTableBody>
                            {tags.data.map((tag) => (
                                <AdminDataTableRow key={tag.id}>
                                    <AdminDataTableCell className="font-medium text-[var(--admin-primary)]">
                                        {tag.name}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-admin-secondary">
                                        {tag.slug}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell>
                                        {tag.postsCount}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <AdminRowActionLink
                                                href={`/admin/blog-tags/${tag.slug}/edit`}
                                            >
                                                {tCommon('edit')}
                                            </AdminRowActionLink>
                                            <AdminRowActionLink
                                                variant="danger"
                                                onClick={() =>
                                                    setDeleteSlug(tag.slug)
                                                }
                                            >
                                                {tCommon('delete')}
                                            </AdminRowActionLink>
                                        </div>
                                    </AdminDataTableCell>
                                </AdminDataTableRow>
                            ))}
                        </AdminDataTableBody>
                    </AdminDataTable>
                )}
            </div>

            <AdminConfirmDialog
                open={deleteSlug !== null}
                onOpenChange={(open) => !open && setDeleteSlug(null)}
                title={t('blogTags.deleteConfirm')}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={destroy}
            />
        </>
    );
}
