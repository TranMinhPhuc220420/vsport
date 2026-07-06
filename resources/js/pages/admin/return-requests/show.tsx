import { Head, router, setLayoutProps, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { AdminCard } from '@/components/admin/ui/admin-card';
import {
    AdminDataTable,
    AdminDataTableBody,
    AdminDataTableCell,
    AdminDataTableHead,
    AdminDataTableHeaderCell,
    AdminDataTableHeaderRow,
    AdminDataTableRow,
} from '@/components/admin/ui/admin-data-table';
import { formatCurrency, formatDateTime, useLocale } from '@/hooks/use-locale';
import type { OrderDetail } from '@/types/order';

type ReturnRequestDetail = {
    id: number;
    status: string;
    reason: string;
    adminNotes: string | null;
    requestedAt: string | null;
    resolvedAt: string | null;
    order?: OrderDetail;
    customer?: { id: number; name: string; email: string } | null;
    items: Array<{
        id: number;
        quantity: number;
        orderItem?: {
            productName: string;
            quantity: number;
            lineTotal: number;
        };
    }>;
};

type AdminReturnRequestShowProps = {
    returnRequest: ReturnRequestDetail;
    allowedNextStatuses: string[];
};

const statusActionKeys: Record<string, string> = {
    approved: 'returnRequests.approve',
    rejected: 'returnRequests.reject',
    received: 'returnRequests.markReceived',
    refunded: 'returnRequests.markRefunded',
    closed: 'returnRequests.close',
};

export default function AdminReturnRequestShow({
    returnRequest,
    allowedNextStatuses,
}: AdminReturnRequestShowProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { locale, currency } = useLocale();
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.returnRequests'),
                href: '/admin/return-requests',
            },
            { title: t('breadcrumb.detail'), href: '#' },
        ],
    });

    const updateStatus = (status: string, notes?: string) => {
        router.patch(
            `/admin/return-requests/${returnRequest.id}/status`,
            {
                status,
                adminNotes: notes ?? undefined,
            },
            {
                onFinish: () => {
                    setShowRejectForm(false);
                    setAdminNotes('');
                },
            },
        );
    };

    const requestStatusChange = (status: string) => {
        if (status === 'rejected') {
            setShowRejectForm(true);

            return;
        }

        updateStatus(status);
    };

    const order = returnRequest.order;

    return (
        <>
            <Head title={t('returnRequests.detailTitle')} />

            <div className="admin-page">
                <AdminPageHeader
                    title={t('returnRequests.detailTitle')}
                    subtitle={
                        order
                            ? t('returnRequests.orderNumber', {
                                  orderNumber: order.orderNumber,
                              })
                            : undefined
                    }
                    backHref="/admin/return-requests"
                    backLabel={t('returnRequests.back')}
                />

                <div className="mt-8 grid gap-6 desktop:grid-cols-2">
                    <AdminCard>
                        <h2 className="admin-section-title">
                            {tCommon('status')}
                        </h2>
                        <p className="admin-body-strong mt-4">
                            {t(
                                `returnRequests.statuses.${returnRequest.status}`,
                            )}
                        </p>
                        <p className="admin-caption text-admin-secondary mt-2">
                            {t('returnRequests.requested')}:{' '}
                            {returnRequest.requestedAt
                                ? formatDateTime(
                                      returnRequest.requestedAt,
                                      locale,
                                  )
                                : tCommon('emDash')}
                        </p>
                    </AdminCard>

                    <AdminCard>
                        <h2 className="admin-section-title">
                            {t('returnRequests.customer')}
                        </h2>
                        {returnRequest.customer ? (
                            <div className="mt-4">
                                <p className="admin-body-strong">
                                    {returnRequest.customer.name}
                                </p>
                                <p className="admin-caption text-admin-secondary">
                                    {returnRequest.customer.email}
                                </p>
                            </div>
                        ) : (
                            <p className="admin-caption text-admin-secondary mt-4">
                                {t('orders.noCustomer')}
                            </p>
                        )}
                    </AdminCard>
                </div>

                <AdminCard className="mt-6">
                    <h2 className="admin-section-title">
                        {t('returnRequests.reason')}
                    </h2>
                    <p className="mt-4 whitespace-pre-wrap">
                        {returnRequest.reason}
                    </p>
                    {returnRequest.adminNotes ? (
                        <div className="border-admin mt-4 border-t pt-4">
                            <p className="admin-caption text-admin-secondary">
                                {t('returnRequests.adminNotes')}
                            </p>
                            <p className="mt-1 whitespace-pre-wrap">
                                {returnRequest.adminNotes}
                            </p>
                        </div>
                    ) : null}
                </AdminCard>

                {order ? (
                    <AdminCard className="mt-6">
                        <h2 className="admin-section-title">
                            {t('returnRequests.items')}
                        </h2>
                        <AdminDataTable className="mt-4">
                            <AdminDataTableHead>
                                <AdminDataTableHeaderRow>
                                    <AdminDataTableHeaderCell>
                                        {t('orders.items')}
                                    </AdminDataTableHeaderCell>
                                    <AdminDataTableHeaderCell>
                                        {t('returnRequests.returnQty')}
                                    </AdminDataTableHeaderCell>
                                    <AdminDataTableHeaderCell>
                                        {tCommon('total')}
                                    </AdminDataTableHeaderCell>
                                </AdminDataTableHeaderRow>
                            </AdminDataTableHead>
                            <AdminDataTableBody>
                                {returnRequest.items.map((item) => (
                                    <AdminDataTableRow key={item.id}>
                                        <AdminDataTableCell>
                                            {item.orderItem?.productName}
                                        </AdminDataTableCell>
                                        <AdminDataTableCell>
                                            {item.quantity}
                                        </AdminDataTableCell>
                                        <AdminDataTableCell>
                                            {item.orderItem
                                                ? formatCurrency(
                                                      item.orderItem.lineTotal,
                                                      locale,
                                                      currency,
                                                  )
                                                : tCommon('emDash')}
                                        </AdminDataTableCell>
                                    </AdminDataTableRow>
                                ))}
                            </AdminDataTableBody>
                        </AdminDataTable>
                    </AdminCard>
                ) : null}

                {allowedNextStatuses.length > 0 && !showRejectForm ? (
                    <div className="mt-8 flex flex-wrap gap-3">
                        {allowedNextStatuses.map((status) => (
                            <AdminButton
                                key={status}
                                variant={
                                    status === 'rejected'
                                        ? 'destructive'
                                        : 'primary'
                                }
                                onClick={() => requestStatusChange(status)}
                            >
                                {t(statusActionKeys[status] ?? status)}
                            </AdminButton>
                        ))}
                    </div>
                ) : null}

                {showRejectForm ? (
                    <AdminCard className="mt-6">
                        <h2 className="admin-section-title">
                            {t('returnRequests.rejectTitle')}
                        </h2>
                        <p className="admin-caption text-admin-secondary mt-2">
                            {t('returnRequests.rejectDescription')}
                        </p>
                        <textarea
                            className="rounded-admin-md border-admin mt-4 w-full border p-3"
                            rows={3}
                            value={adminNotes}
                            onChange={(event) =>
                                setAdminNotes(event.target.value)
                            }
                            placeholder={t(
                                'returnRequests.rejectNotesPlaceholder',
                            )}
                        />
                        {errors.adminNotes ? (
                            <p className="admin-caption mt-2 text-red-600">
                                {errors.adminNotes}
                            </p>
                        ) : null}
                        <div className="mt-4 flex gap-3">
                            <AdminButton
                                variant="destructive"
                                onClick={() =>
                                    updateStatus('rejected', adminNotes)
                                }
                            >
                                {t('returnRequests.reject')}
                            </AdminButton>
                            <AdminButton
                                variant="secondary"
                                onClick={() => {
                                    setShowRejectForm(false);
                                    setAdminNotes('');
                                }}
                            >
                                {tCommon('cancel')}
                            </AdminButton>
                        </div>
                    </AdminCard>
                ) : null}

                {errors.status ? (
                    <p className="admin-caption mt-4 text-red-600">
                        {errors.status}
                    </p>
                ) : null}
            </div>
        </>
    );
}
