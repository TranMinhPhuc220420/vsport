import { Head, router, setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
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
import { AdminSkeletonRows } from '@/components/admin/ui/admin-skeleton-rows';
import { useAdminFilterPending } from '@/hooks/use-admin-filter-pending';
import { formatDateTime, useLocale } from '@/hooks/use-locale';

type SubscriberRow = {
    id: number;
    email: string;
    source: string;
    subscribedAt: string;
};

type AdminNewsletterSubscribersIndexProps = {
    subscribers: {
        data: SubscriberRow[];
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
    filters: { source: string | null };
    sourceOptions: string[];
};

export default function AdminNewsletterSubscribersIndex({
    subscribers,
    filters,
    sourceOptions,
}: AdminNewsletterSubscribersIndexProps) {
    const { t } = useTranslation('admin');
    const { locale } = useLocale();
    const { isPending, onStart, onFinish } = useAdminFilterPending();

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.newsletter'),
                href: '/admin/newsletter-subscribers',
            },
        ],
    });

    const filterOptions = [
        { value: 'all', label: t('newsletter.filterAll') },
        ...sourceOptions.map((source) => ({
            value: source,
            label: t(`newsletter.sources.${source}`, { defaultValue: source }),
        })),
    ];

    const applySource = (source: string | null) => {
        if (source === null) {
            return;
        }

        router.get(
            '/admin/newsletter-subscribers',
            source === 'all' ? {} : { source },
            { preserveState: true, onStart, onFinish },
        );
    };

    const exportParams = new URLSearchParams();

    if (filters.source) {
        exportParams.set('source', filters.source);
    }

    const exportHref = `/admin/newsletter-subscribers/export${
        exportParams.toString() ? `?${exportParams.toString()}` : ''
    }`;

    return (
        <>
            <Head title={t('newsletter.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('newsletter.title')}
                    subtitle={t('newsletter.description')}
                    actions={
                        <AdminButton asChild variant="secondary">
                            <a href={exportHref}>{t('newsletter.exportCsv')}</a>
                        </AdminButton>
                    }
                />

                <AdminFilterTabs
                    value={filters.source ?? 'all'}
                    onChange={applySource}
                    options={filterOptions}
                    disabled={isPending}
                />

                {!isPending && subscribers.data.length === 0 ? (
                    <AdminEmptyState
                        title={t('newsletter.emptyTitle')}
                        description={t('newsletter.emptyDescription')}
                    />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <AdminDataTable>
                                <AdminDataTableHead>
                                    <AdminDataTableHeaderRow>
                                        <AdminDataTableHeaderCell>
                                            {t('newsletter.email')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('newsletter.source')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('newsletter.subscribedAt')}
                                        </AdminDataTableHeaderCell>
                                    </AdminDataTableHeaderRow>
                                </AdminDataTableHead>
                                <AdminDataTableBody>
                                    {isPending ? (
                                        <AdminSkeletonRows columns={3} />
                                    ) : (
                                        subscribers.data.map((subscriber) => (
                                            <AdminDataTableRow
                                                key={subscriber.id}
                                            >
                                                <AdminDataTableCell className="font-medium text-[var(--admin-primary)]">
                                                    {subscriber.email}
                                                </AdminDataTableCell>
                                                <AdminDataTableCell className="text-admin-secondary">
                                                    {t(
                                                        `newsletter.sources.${subscriber.source}`,
                                                        {
                                                            defaultValue:
                                                                subscriber.source,
                                                        },
                                                    )}
                                                </AdminDataTableCell>
                                                <AdminDataTableCell className="text-admin-secondary">
                                                    {formatDateTime(
                                                        subscriber.subscribedAt,
                                                        locale,
                                                    )}
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
                                subscribers.data.map((subscriber) => (
                                    <AdminCardListItem
                                        key={subscriber.id}
                                        title={subscriber.email}
                                        subtitle={t(
                                            `newsletter.sources.${subscriber.source}`,
                                            { defaultValue: subscriber.source },
                                        )}
                                    >
                                        <AdminCardListField
                                            label={t('newsletter.subscribedAt')}
                                        >
                                            {formatDateTime(
                                                subscriber.subscribedAt,
                                                locale,
                                            )}
                                        </AdminCardListField>
                                    </AdminCardListItem>
                                ))
                            )}
                        </AdminCardList>
                    </>
                )}

                <AdminPagination
                    links={subscribers.links}
                    meta={{
                        current_page: subscribers.meta.current_page,
                        from: null,
                        last_page: subscribers.meta.last_page,
                        per_page: 20,
                        to: null,
                        total: subscribers.meta.total,
                    }}
                />
            </div>
        </>
    );
}
