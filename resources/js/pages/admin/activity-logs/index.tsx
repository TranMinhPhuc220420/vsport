import { Head, router, setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
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

type ActivityLogRow = {
    id: number;
    action: string;
    actorName: string;
    actorEmail: string;
    subjectType: string | null;
    subjectId: number | null;
    properties: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: string | null;
};

type AdminActivityLogsIndexProps = {
    logs: {
        data: ActivityLogRow[];
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
    filters: { action: string | null };
    actionOptions: string[];
};

function formatSubject(
    subjectType: string | null,
    subjectId: number | null,
): string {
    if (!subjectType || subjectId === null) {
        return '—';
    }

    const shortType = subjectType.split('\\').pop() ?? subjectType;

    return `${shortType} #${subjectId}`;
}

function formatProperties(properties: Record<string, unknown> | null): string {
    if (!properties || Object.keys(properties).length === 0) {
        return '—';
    }

    return JSON.stringify(properties);
}

export default function AdminActivityLogsIndex({
    logs,
    filters,
    actionOptions,
}: AdminActivityLogsIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { locale } = useLocale();

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.activityLogs'),
                href: '/admin/activity-logs',
            },
        ],
    });

    const filterOptions = [
        { value: null, label: tCommon('all') },
        ...actionOptions.map((action) => ({
            value: action,
            label: t(`activityLogs.actions.${action}`, {
                defaultValue: action,
            }),
        })),
    ];

    const applyAction = (action: string | null) => {
        router.get(
            '/admin/activity-logs',
            { action: action ?? undefined },
            { preserveState: true },
        );
    };

    return (
        <>
            <Head title={t('activityLogs.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('activityLogs.title')}
                    subtitle={t('activityLogs.description')}
                />

                <AdminFilterTabs
                    value={filters.action}
                    onChange={applyAction}
                    options={filterOptions}
                />

                <AdminDataTable minWidth="960px">
                    <AdminDataTableHead>
                        <AdminDataTableHeaderRow>
                            <AdminDataTableHeaderCell>
                                {tCommon('date')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('activityLogs.actor')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('activityLogs.action')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('activityLogs.subject')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('activityLogs.details')}
                            </AdminDataTableHeaderCell>
                            <AdminDataTableHeaderCell>
                                {t('activityLogs.ip')}
                            </AdminDataTableHeaderCell>
                        </AdminDataTableHeaderRow>
                    </AdminDataTableHead>
                    <AdminDataTableBody>
                        {logs.data.map((log) => (
                            <AdminDataTableRow key={log.id}>
                                <AdminDataTableCell className="text-admin-secondary">
                                    {log.createdAt
                                        ? formatDateTime(
                                              log.createdAt,
                                              locale,
                                              {
                                                  dateStyle: 'medium',
                                                  timeStyle: 'short',
                                              },
                                          )
                                        : tCommon('emDash')}
                                </AdminDataTableCell>
                                <AdminDataTableCell>
                                    <div className="font-medium">
                                        {log.actorName}
                                    </div>
                                    <div className="text-admin-secondary text-sm">
                                        {log.actorEmail}
                                    </div>
                                </AdminDataTableCell>
                                <AdminDataTableCell>
                                    {t(`activityLogs.actions.${log.action}`, {
                                        defaultValue: log.action,
                                    })}
                                </AdminDataTableCell>
                                <AdminDataTableCell className="text-admin-secondary">
                                    {formatSubject(
                                        log.subjectType,
                                        log.subjectId,
                                    )}
                                </AdminDataTableCell>
                                <AdminDataTableCell className="text-admin-secondary max-w-xs truncate">
                                    {formatProperties(log.properties)}
                                </AdminDataTableCell>
                                <AdminDataTableCell className="text-admin-secondary">
                                    {log.ipAddress ?? tCommon('emDash')}
                                </AdminDataTableCell>
                            </AdminDataTableRow>
                        ))}
                    </AdminDataTableBody>
                </AdminDataTable>

                <AdminPagination
                    links={logs.links}
                    meta={{
                        current_page: logs.meta.current_page,
                        from: null,
                        last_page: logs.meta.last_page,
                        per_page: 30,
                        to: null,
                        total: logs.meta.total,
                    }}
                />
            </div>
        </>
    );
}
