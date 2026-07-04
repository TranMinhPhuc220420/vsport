import { Head, router, setLayoutProps, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminConfirmDialog } from '@/components/admin/admin-confirm-dialog';
import { AdminInputField } from '@/components/admin/admin-field';
import { adminSelectClassName } from '@/components/admin/admin-form';
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
import { AdminPagination } from '@/components/admin/ui/admin-pagination';
import { AdminSkeletonRows } from '@/components/admin/ui/admin-skeleton-rows';
import { useAdminFilterPending } from '@/hooks/use-admin-filter-pending';
import { formatDate, useLocale } from '@/hooks/use-locale';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string | null;
};

type PendingRoleChange = {
    userId: number;
    userName: string;
    role: string;
};

type AdminUsersIndexProps = {
    users: {
        data: UserRow[];
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
    filters: { search: string | null };
    roleOptions: string[];
};

function roleLabelKey(role: string): string {
    return `users.roles.${role}`;
}

export default function AdminUsersIndex({
    users,
    filters,
    roleOptions,
}: AdminUsersIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { locale } = useLocale();
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [pendingRoleChange, setPendingRoleChange] =
        useState<PendingRoleChange | null>(null);
    const [updatingRole, setUpdatingRole] = useState(false);
    const { isPending, onStart, onFinish } = useAdminFilterPending();

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.users'), href: '/admin/users' },
        ],
    });

    const applySearch = useCallback(
        (value: string) => {
            router.get(
                '/admin/users',
                { search: value || undefined },
                { preserveState: true, replace: true, onStart, onFinish },
            );
        },
        [onStart, onFinish],
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                applySearch(search);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters.search, applySearch]);

    const requestRoleChange = (
        user: UserRow,
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        const newRole = event.target.value;

        if (newRole === user.role) {
            return;
        }

        setPendingRoleChange({
            userId: user.id,
            userName: user.name,
            role: newRole,
        });
    };

    const confirmRoleChange = () => {
        if (!pendingRoleChange) {
            return;
        }

        setUpdatingRole(true);

        router.patch(
            `/admin/users/${pendingRoleChange.userId}/role`,
            { role: pendingRoleChange.role },
            {
                onFinish: () => {
                    setUpdatingRole(false);
                    setPendingRoleChange(null);
                },
            },
        );
    };

    return (
        <>
            <Head title={t('users.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('users.title')}
                    subtitle={t('users.description')}
                />

                <div className="flex max-w-md flex-wrap items-end gap-3">
                    <AdminInputField
                        label={t('users.search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('users.searchPlaceholder')}
                        className="min-w-[220px] flex-1"
                        disabled={isPending}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                applySearch(search);
                            }
                        }}
                    />
                    <AdminButton
                        type="button"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => applySearch(search)}
                    >
                        {tCommon('search')}
                    </AdminButton>
                </div>

                {!isPending && users.data.length === 0 ? (
                    <AdminEmptyState
                        title={t('users.noResults')}
                        description={
                            filters.search
                                ? t('users.noResultsSearch')
                                : t('users.noUsers')
                        }
                    />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <AdminDataTable>
                                <AdminDataTableHead>
                                    <AdminDataTableHeaderRow>
                                        <AdminDataTableHeaderCell>
                                            {tCommon('name')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {tCommon('email')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('users.role')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('users.joined')}
                                        </AdminDataTableHeaderCell>
                                    </AdminDataTableHeaderRow>
                                </AdminDataTableHead>
                                <AdminDataTableBody>
                                    {isPending ? (
                                        <AdminSkeletonRows columns={4} />
                                    ) : (
                                        users.data.map((user) => (
                                            <AdminDataTableRow key={user.id}>
                                                <AdminDataTableCell className="font-medium text-[var(--admin-primary)]">
                                                    {user.name}
                                                    {user.id ===
                                                        auth.user.id && (
                                                        <span className="text-admin-secondary ml-2 text-xs">
                                                            {t('users.you')}
                                                        </span>
                                                    )}
                                                </AdminDataTableCell>
                                                <AdminDataTableCell className="text-admin-secondary">
                                                    {user.email}
                                                </AdminDataTableCell>
                                                <AdminDataTableCell>
                                                    <select
                                                        key={`${user.id}-${user.role}`}
                                                        className={
                                                            adminSelectClassName
                                                        }
                                                        value={user.role}
                                                        disabled={
                                                            user.id ===
                                                            auth.user.id
                                                        }
                                                        onChange={(event) =>
                                                            requestRoleChange(
                                                                user,
                                                                event,
                                                            )
                                                        }
                                                    >
                                                        {roleOptions.map(
                                                            (role) => (
                                                                <option
                                                                    key={role}
                                                                    value={role}
                                                                >
                                                                    {t(
                                                                        roleLabelKey(
                                                                            role,
                                                                        ),
                                                                        {
                                                                            defaultValue:
                                                                                role,
                                                                        },
                                                                    )}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </AdminDataTableCell>
                                                <AdminDataTableCell className="text-admin-secondary">
                                                    {user.createdAt
                                                        ? formatDate(
                                                              user.createdAt,
                                                              locale,
                                                          )
                                                        : tCommon('emDash')}
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
                                users.data.map((user) => (
                                    <AdminCardListItem
                                        key={user.id}
                                        title={
                                            <>
                                                {user.name}
                                                {user.id === auth.user.id && (
                                                    <span className="text-admin-secondary ml-2 text-xs">
                                                        {t('users.you')}
                                                    </span>
                                                )}
                                            </>
                                        }
                                        subtitle={user.email}
                                    >
                                        <AdminCardListField
                                            label={t('users.role')}
                                        >
                                            <select
                                                key={`${user.id}-${user.role}`}
                                                className={adminSelectClassName}
                                                value={user.role}
                                                disabled={
                                                    user.id === auth.user.id
                                                }
                                                onChange={(event) =>
                                                    requestRoleChange(
                                                        user,
                                                        event,
                                                    )
                                                }
                                            >
                                                {roleOptions.map((role) => (
                                                    <option
                                                        key={role}
                                                        value={role}
                                                    >
                                                        {t(roleLabelKey(role), {
                                                            defaultValue: role,
                                                        })}
                                                    </option>
                                                ))}
                                            </select>
                                        </AdminCardListField>
                                        <AdminCardListField
                                            label={t('users.joined')}
                                        >
                                            {user.createdAt
                                                ? formatDate(
                                                      user.createdAt,
                                                      locale,
                                                  )
                                                : tCommon('emDash')}
                                        </AdminCardListField>
                                    </AdminCardListItem>
                                ))
                            )}
                        </AdminCardList>
                    </>
                )}

                <AdminPagination
                    links={users.links}
                    meta={{
                        current_page: users.meta.current_page,
                        from: null,
                        last_page: users.meta.last_page,
                        per_page: 20,
                        to: null,
                        total: users.meta.total,
                    }}
                />
            </div>

            <AdminConfirmDialog
                open={pendingRoleChange !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingRoleChange(null);
                    }
                }}
                title={t('users.changeRoleTitle')}
                description={
                    pendingRoleChange
                        ? t('users.changeRoleDescription', {
                              name: pendingRoleChange.userName,
                              role: t(roleLabelKey(pendingRoleChange.role), {
                                  defaultValue: pendingRoleChange.role,
                              }),
                          })
                        : undefined
                }
                confirmLabel={t('users.confirmRoleChange')}
                onConfirm={confirmRoleChange}
                loading={updatingRole}
            />
        </>
    );
}
