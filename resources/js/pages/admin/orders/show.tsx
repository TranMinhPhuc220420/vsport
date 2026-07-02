import { Head, router, setLayoutProps, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminConfirmDialog } from '@/components/admin/admin-confirm-dialog';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { OrderStatusStepper } from '@/components/admin/order-status-stepper';
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
import {
    formatCurrency,
    formatDateTime,
    useLocale,
} from '@/hooks/use-locale';
import type { OrderDetail } from '@/types/order';

type AdminOrderShowPageProps = {
    order: OrderDetail & {
        customer?: { id: number; name: string; email: string } | null;
    };
    allowedNextStatuses: string[];
};

const statusActionKeys: Record<string, string> = {
    confirmed: 'orders.confirm',
    shipping: 'orders.markShipping',
    delivered: 'orders.markDelivered',
    completed: 'orders.complete',
    cancelled: 'orders.cancel',
};

export default function AdminOrderShow({
    order,
    allowedNextStatuses,
}: AdminOrderShowPageProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { locale } = useLocale();
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.orders'), href: '/admin/orders' },
            { title: t('breadcrumb.detail'), href: '#' },
        ],
    });

    const updateStatus = (status: string) => {
        router.patch(
            `/admin/orders/${order.orderNumber}/status`,
            { status },
            { onFinish: () => setPendingStatus(null) },
        );
    };

    const requestStatusChange = (status: string) => {
        if (status === 'cancelled') {
            setPendingStatus(status);
            return;
        }

        updateStatus(status);
    };

    const placedDate = order.createdAt
        ? formatDateTime(order.createdAt, locale, {
              dateStyle: 'medium',
              timeStyle: 'short',
          })
        : tCommon('emDash');

    const paymentMethodLabel = order.paymentMethod
        ? t(`orders.paymentMethods.${order.paymentMethod}`, {
              defaultValue: order.paymentMethod,
          })
        : tCommon('emDash');

    const hasDiscount =
        (order.discountAmount ?? 0) > 0 || Boolean(order.discountCode);

    return (
        <>
            <Head
                title={t('orders.orderNumber', {
                    orderNumber: order.orderNumber,
                })}
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/orders"
                    backLabel={t('orders.back')}
                    title={t('orders.orderNumber', {
                        orderNumber: order.orderNumber,
                    })}
                    subtitle={t('orders.placed', { date: placedDate })}
                />

                <OrderStatusStepper currentStatus={order.status} />

                {errors.status && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errors.status}
                    </p>
                )}

                <div className="grid gap-6 desktop:grid-cols-3">
                    <AdminCard>
                        <h2 className="admin-section-title">
                            {t('orders.customer')}
                        </h2>
                        {order.customer ? (
                            <dl className="mt-4 space-y-3 text-sm text-[var(--admin-primary)]">
                                <div>
                                    <dt className="admin-label">
                                        {tCommon('name')}
                                    </dt>
                                    <dd className="mt-0.5">
                                        {order.customer.name}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="admin-label">
                                        {tCommon('email')}
                                    </dt>
                                    <dd className="mt-0.5">
                                        {order.customer.email}
                                    </dd>
                                </div>
                            </dl>
                        ) : (
                            <p className="mt-4 text-sm text-admin-secondary">
                                {t('orders.noCustomer')}
                            </p>
                        )}
                    </AdminCard>

                    <AdminCard>
                        <h2 className="admin-section-title">
                            {t('orders.payment')}
                        </h2>
                        <dl className="mt-4 space-y-3 text-sm text-[var(--admin-primary)]">
                            <div>
                                <dt className="admin-label">
                                    {t('orders.paymentMethod')}
                                </dt>
                                <dd className="mt-0.5">{paymentMethodLabel}</dd>
                            </div>
                            {order.paymentIntentId && (
                                <div>
                                    <dt className="admin-label">
                                        {t('orders.paymentIntent')}
                                    </dt>
                                    <dd className="mt-0.5 break-all font-mono text-xs">
                                        {order.paymentIntentId}
                                    </dd>
                                </div>
                            )}
                            {hasDiscount && (
                                <div>
                                    <dt className="admin-label">
                                        {t('orders.discount')}
                                    </dt>
                                    <dd className="mt-0.5">
                                        {order.discountCode && (
                                            <span className="font-medium">
                                                {order.discountCode}
                                            </span>
                                        )}
                                        {(order.discountAmount ?? 0) > 0 && (
                                            <span className="ml-2 text-admin-secondary">
                                                −
                                                {formatCurrency(
                                                    order.discountAmount ?? 0,
                                                    locale,
                                                )}
                                            </span>
                                        )}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </AdminCard>

                    <AdminCard>
                        <h2 className="admin-section-title">
                            {t('orders.shipping')}
                        </h2>
                        <dl className="mt-4 space-y-3 text-sm text-[var(--admin-primary)]">
                            <div>
                                <dt className="admin-label">
                                    {tCommon('name')}
                                </dt>
                                <dd className="mt-0.5">
                                    {order.shippingAddress.name}
                                </dd>
                            </div>
                            <div>
                                <dt className="admin-label">
                                    {tCommon('phone')}
                                </dt>
                                <dd className="mt-0.5">
                                    {order.shippingAddress.phone}
                                </dd>
                            </div>
                            <div>
                                <dt className="admin-label">
                                    {tCommon('address')}
                                </dt>
                                <dd className="mt-0.5 whitespace-pre-wrap">
                                    {order.shippingAddress.address}
                                </dd>
                            </div>
                        </dl>
                    </AdminCard>
                </div>

                <AdminCard className="p-0">
                    <h2 className="admin-section-title border-b border-admin px-6 py-4">
                        {t('orders.items')}
                    </h2>
                    <ul>
                        {order.items.map((item) => (
                            <li
                                key={item.id}
                                className="flex justify-between gap-4 border-b border-admin px-6 py-4 last:border-b-0"
                            >
                                <div>
                                    <p className="font-medium text-[var(--admin-primary)]">
                                        {item.productName}
                                    </p>
                                    <p className="text-sm text-admin-secondary">
                                        {item.colorName} / {item.size} ×{' '}
                                        {item.quantity}
                                    </p>
                                </div>
                                <span className="font-medium text-[var(--admin-primary)]">
                                    {formatCurrency(item.lineTotal, locale)}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <div className="space-y-2 border-t border-admin px-6 py-4 text-sm text-[var(--admin-primary)]">
                        {hasDiscount && (
                            <>
                                <div className="flex justify-between">
                                    <span>{t('orders.subtotal')}</span>
                                    <span>
                                        {formatCurrency(
                                            order.subtotalAmount ??
                                                order.totalAmount,
                                            locale,
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-admin-secondary">
                                    <span>{t('orders.discount')}</span>
                                    <span>
                                        −
                                        {formatCurrency(
                                            order.discountAmount ?? 0,
                                            locale,
                                        )}
                                    </span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between font-medium">
                            <span>{tCommon('total')}</span>
                            <span>
                                {formatCurrency(order.totalAmount, locale)}
                            </span>
                        </div>
                    </div>
                </AdminCard>

                {allowedNextStatuses.length > 0 && (
                    <section className="flex flex-wrap gap-3">
                        {allowedNextStatuses.map((status, index) => {
                            const isCancel = status === 'cancelled';
                            const isPrimary =
                                !isCancel &&
                                index ===
                                    allowedNextStatuses.findIndex(
                                        (s) => s !== 'cancelled',
                                    );

                            return (
                                <AdminButton
                                    key={status}
                                    variant={
                                        isCancel
                                            ? 'secondary'
                                            : isPrimary
                                              ? 'primary'
                                              : 'secondary'
                                    }
                                    onClick={() => requestStatusChange(status)}
                                >
                                    {t(statusActionKeys[status] ?? status, {
                                        defaultValue: status,
                                    })}
                                </AdminButton>
                            );
                        })}
                    </section>
                )}
            </div>

            <AdminConfirmDialog
                open={pendingStatus === 'cancelled'}
                onOpenChange={(open) => !open && setPendingStatus(null)}
                title={t('orders.cancelConfirmTitle')}
                description={t('orders.cancelConfirmDescription')}
                variant="destructive"
                confirmLabel={t('orders.cancel')}
                onConfirm={() => updateStatus('cancelled')}
            />
        </>
    );
}
