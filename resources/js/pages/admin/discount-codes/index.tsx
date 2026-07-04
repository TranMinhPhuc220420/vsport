import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminConfirmDialog } from '@/components/admin/admin-confirm-dialog';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import {
    AdminCardList,
    AdminCardListField,
    AdminCardListItem,
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
import { AdminPagination } from '@/components/admin/ui/admin-pagination';
import { AdminRowActionLink } from '@/components/admin/ui/admin-row-action-link';
import { formatCurrency, formatDateTime, useLocale } from '@/hooks/use-locale';

type DiscountCodeRow = {
    id: number;
    code: string;
    type: 'percent' | 'fixed';
    value: number;
    minOrderAmount: number;
    maxUses: number | null;
    usedCount: number;
    startsAt: string | null;
    expiresAt: string | null;
    isActive: boolean;
};

type AdminDiscountCodesIndexProps = {
    discountCodes: {
        data: DiscountCodeRow[];
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
};

export default function AdminDiscountCodesIndex({
    discountCodes,
}: AdminDiscountCodesIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { locale, currency } = useLocale();
    const [deleteId, setDeleteId] = useState<number | null>(null);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.discountCodes'),
                href: '/admin/discount-codes',
            },
        ],
    });

    const destroy = () => {
        if (deleteId === null) {
            return;
        }

        router.delete(`/admin/discount-codes/${deleteId}`, {
            onFinish: () => setDeleteId(null),
        });
    };

    const formatValue = (type: DiscountCodeRow['type'], value: number) => {
        if (type === 'percent') {
            return `${value}%`;
        }

        return formatCurrency(value, locale, currency);
    };

    const formatDiscountDate = (value: string | null): string => {
        if (!value) {
            return tCommon('emDash');
        }

        return formatDateTime(value, locale);
    };

    const formatType = (type: DiscountCodeRow['type']) => {
        return type === 'percent'
            ? t('discountCodes.percent')
            : t('discountCodes.fixed');
    };

    return (
        <>
            <Head title={t('discountCodes.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('discountCodes.title')}
                    subtitle={t('discountCodes.description')}
                    actions={
                        <AdminButton asChild>
                            <Link href="/admin/discount-codes/create">
                                {t('discountCodes.new')}
                            </Link>
                        </AdminButton>
                    }
                />

                {discountCodes.data.length === 0 ? (
                    <AdminEmptyState
                        title={t('discountCodes.emptyTitle')}
                        description={t('discountCodes.emptyDescription')}
                        action={
                            <AdminButton asChild variant="secondary">
                                <Link href="/admin/discount-codes/create">
                                    {t('discountCodes.new')}
                                </Link>
                            </AdminButton>
                        }
                    />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <AdminDataTable>
                                <AdminDataTableHead>
                                    <AdminDataTableHeaderRow>
                                        <AdminDataTableHeaderCell>
                                            {t('discountCodes.code')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('discountCodes.type')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('discountCodes.value')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('discountCodes.minOrder')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('discountCodes.uses')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('discountCodes.starts')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('discountCodes.expires')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {tCommon('status')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell className="text-right">
                                            {tCommon('actions')}
                                        </AdminDataTableHeaderCell>
                                    </AdminDataTableHeaderRow>
                                </AdminDataTableHead>
                                <AdminDataTableBody>
                                    {discountCodes.data.map((code) => (
                                        <AdminDataTableRow key={code.id}>
                                            <AdminDataTableCell className="font-medium text-[var(--admin-primary)]">
                                                {code.code}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell className="text-admin-secondary">
                                                {formatType(code.type)}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell>
                                                {formatValue(
                                                    code.type,
                                                    code.value,
                                                )}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell className="text-admin-secondary">
                                                {code.minOrderAmount > 0
                                                    ? formatCurrency(
                                                          code.minOrderAmount,
                                                          locale,
                                                          currency,
                                                      )
                                                    : tCommon('emDash')}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell className="text-admin-secondary">
                                                {code.usedCount}
                                                {code.maxUses !== null
                                                    ? ` / ${code.maxUses}`
                                                    : ''}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell className="text-admin-secondary">
                                                {formatDiscountDate(
                                                    code.startsAt,
                                                )}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell className="text-admin-secondary">
                                                {formatDiscountDate(
                                                    code.expiresAt,
                                                )}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell>
                                                {code.isActive
                                                    ? tCommon('active')
                                                    : tCommon('inactive')}
                                            </AdminDataTableCell>
                                            <AdminDataTableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <AdminRowActionLink
                                                        href={`/admin/discount-codes/${code.id}/edit`}
                                                    >
                                                        {tCommon('edit')}
                                                    </AdminRowActionLink>
                                                    <AdminRowActionLink
                                                        variant="danger"
                                                        onClick={() =>
                                                            setDeleteId(code.id)
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
                        </div>

                        <AdminCardList className="md:hidden">
                            {discountCodes.data.map((code) => (
                                <AdminCardListItem
                                    key={code.id}
                                    title={code.code}
                                    subtitle={`${formatType(code.type)} · ${formatValue(code.type, code.value)}`}
                                    badge={
                                        <span
                                            className={
                                                code.isActive
                                                    ? 'rounded-admin-sm bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800'
                                                    : 'border-admin text-admin-secondary rounded-admin-sm bg-[var(--admin-neutral)] px-2 py-0.5 text-xs font-medium'
                                            }
                                        >
                                            {code.isActive
                                                ? tCommon('active')
                                                : tCommon('inactive')}
                                        </span>
                                    }
                                    actions={
                                        <>
                                            <AdminRowActionLink
                                                href={`/admin/discount-codes/${code.id}/edit`}
                                            >
                                                {tCommon('edit')}
                                            </AdminRowActionLink>
                                            <AdminRowActionLink
                                                variant="danger"
                                                onClick={() =>
                                                    setDeleteId(code.id)
                                                }
                                            >
                                                {tCommon('delete')}
                                            </AdminRowActionLink>
                                        </>
                                    }
                                >
                                    <AdminCardListField
                                        label={t('discountCodes.minOrder')}
                                    >
                                        {code.minOrderAmount > 0
                                            ? formatCurrency(
                                                  code.minOrderAmount,
                                                  locale,
                                                  currency,
                                              )
                                            : tCommon('emDash')}
                                    </AdminCardListField>
                                    <AdminCardListField
                                        label={t('discountCodes.uses')}
                                    >
                                        {code.usedCount}
                                        {code.maxUses !== null
                                            ? ` / ${code.maxUses}`
                                            : ''}
                                    </AdminCardListField>
                                    <AdminCardListField
                                        label={t('discountCodes.starts')}
                                    >
                                        {formatDiscountDate(code.startsAt)}
                                    </AdminCardListField>
                                    <AdminCardListField
                                        label={t('discountCodes.expires')}
                                    >
                                        {formatDiscountDate(code.expiresAt)}
                                    </AdminCardListField>
                                </AdminCardListItem>
                            ))}
                        </AdminCardList>
                    </>
                )}

                <AdminPagination
                    links={discountCodes.links}
                    meta={{
                        current_page: discountCodes.meta.current_page,
                        from: null,
                        last_page: discountCodes.meta.last_page,
                        per_page: 15,
                        to: null,
                        total: discountCodes.meta.total,
                    }}
                />
            </div>

            <AdminConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={t('discountCodes.deleteConfirm')}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={destroy}
            />
        </>
    );
}
