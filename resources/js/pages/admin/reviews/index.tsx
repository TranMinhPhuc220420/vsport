import { Head, router, setLayoutProps } from '@inertiajs/react';
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
import { AdminFilterTabs } from '@/components/admin/ui/admin-filter-tabs';
import { AdminPagination } from '@/components/admin/ui/admin-pagination';
import { formatDateTime, useLocale } from '@/hooks/use-locale';

type ReviewRow = {
    id: number;
    productName: string;
    userName: string;
    rating: number;
    title: string | null;
    body: string | null;
    isApproved: boolean;
    createdAt: string | null;
};

type AdminReviewsIndexProps = {
    reviews: {
        data: ReviewRow[];
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
    filters: { status: string };
};

export default function AdminReviewsIndex({
    reviews,
    filters,
}: AdminReviewsIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { locale } = useLocale();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.reviews'), href: '/admin/reviews' },
        ],
    });

    const filterOptions = [
        { value: 'pending', label: t('reviews.filterPending') },
        { value: 'approved', label: t('reviews.filterApproved') },
        { value: 'all', label: t('reviews.filterAll') },
    ];

    const applyStatus = (status: string | null) => {
        if (status === null) {
            return;
        }

        router.get('/admin/reviews', { status }, { preserveState: true });
    };

    const approve = (id: number) => {
        router.patch(`/admin/reviews/${id}/approve`);
    };

    const destroy = () => {
        if (deleteId === null) {
            return;
        }

        router.delete(`/admin/reviews/${deleteId}`, {
            onFinish: () => setDeleteId(null),
        });
    };

    const formatSubmitted = (value: string | null): string => {
        if (!value) {
            return tCommon('emDash');
        }

        return formatDateTime(value, locale);
    };

    const emptyMessage =
        filters.status === 'approved'
            ? t('reviews.noApproved')
            : filters.status === 'all'
              ? t('reviews.noReviews')
              : t('reviews.noPending');

    return (
        <>
            <Head title={t('reviews.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('reviews.title')}
                    subtitle={t('reviews.description')}
                />

                <AdminFilterTabs
                    value={filters.status}
                    onChange={applyStatus}
                    options={filterOptions}
                />

                <AdminDataTable>
                    <AdminDataTableHead>
                        <AdminDataTableHeaderRow>
                            <AdminDataTableHeaderCell>
                                {t('reviews.product')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('reviews.customer')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('reviews.rating')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('reviews.review')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('reviews.submitted')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell className="text-right">
                                {tCommon('actions')}
                            </AdminDataTableHeaderCell>
                        </AdminDataTableHeaderRow>
                    </AdminDataTableHead>
                    <AdminDataTableBody>
                        {reviews.data.length === 0 ? (
                            <AdminDataTableRow>
                                <AdminDataTableCell
                                    colSpan={6}
                                    className="text-admin-secondary py-8 text-center"
                                >
                                    {emptyMessage}
                                </AdminDataTableCell>
                            </AdminDataTableRow>
                        ) : (
                            reviews.data.map((review) => (
                                <AdminDataTableRow
                                    key={review.id}
                                    className="align-top"
                                >
                                    <AdminDataTableCell className="font-medium text-[var(--admin-primary)]">
                                        {review.productName}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-admin-secondary">
                                        {review.userName}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell>
                                        {t('reviews.ratingOf', {
                                            rating: review.rating,
                                        })}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell>
                                        {review.title && (
                                            <p className="font-medium text-[var(--admin-primary)]">
                                                {review.title}
                                            </p>
                                        )}
                                        {review.body && (
                                            <p className="text-admin-secondary mt-1 text-sm">
                                                {review.body}
                                            </p>
                                        )}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-admin-secondary">
                                        {formatSubmitted(review.createdAt)}
                                    </AdminDataTableCell>
                                    <AdminDataTableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {!review.isApproved && (
                                                <AdminButton
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        approve(review.id)
                                                    }
                                                >
                                                    {t('reviews.approve')}
                                                </AdminButton>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setDeleteId(review.id)
                                                }
                                                className="text-sm text-red-600 hover:underline"
                                            >
                                                {tCommon('delete')}
                                            </button>
                                        </div>
                                    </AdminDataTableCell>
                                </AdminDataTableRow>
                            ))
                        )}
                    </AdminDataTableBody>
                </AdminDataTable>

                <AdminPagination
                    links={reviews.links}
                    meta={{
                        current_page: reviews.meta.current_page,
                        from: null,
                        last_page: reviews.meta.last_page,
                        per_page: 20,
                        to: null,
                        total: reviews.meta.total,
                    }}
                />
            </div>

            <AdminConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={t('reviews.deleteConfirm')}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={destroy}
            />
        </>
    );
}
