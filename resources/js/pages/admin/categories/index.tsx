import { Head, Link, router, setLayoutProps, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminConfirmDialog } from '@/components/admin/admin-confirm-dialog';
import { AdminInputField } from '@/components/admin/admin-field';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { AdminEmptyState } from '@/components/admin/ui/admin-empty-state';
import { AdminFilterTabs } from '@/components/admin/ui/admin-filter-tabs';
import { AdminStatCard } from '@/components/admin/ui/admin-stat-card';
import { useAdminFilterPending } from '@/hooks/use-admin-filter-pending';
import {
    buildCategoryTree,
    filterCategoryTree,
    flattenCategoryTree,
    getDefaultExpandedIds,
} from '@/lib/category-tree';
import type { CategoryScope, CategoryTreeRow } from '@/lib/category-tree';
import {
    CategoryTreeCards,
    CategoryTreeTable,
} from '@/pages/admin/categories/components/category-tree-table';

type AdminCategoriesIndexProps = {
    categories: { data: CategoryTreeRow[] };
    stats: {
        total: number;
        roots: number;
        missingImages: number;
    };
    filters: {
        search: string | null;
        scope: CategoryScope;
    };
};

export default function AdminCategoriesIndex({
    categories,
    stats,
    filters,
}: AdminCategoriesIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const { isPending, onStart, onFinish } = useAdminFilterPending();

    const tree = useMemo(
        () => buildCategoryTree(categories.data),
        [categories.data],
    );

    const [expandedIds, setExpandedIds] = useState<Set<number>>(() =>
        getDefaultExpandedIds(tree),
    );

    const { roots: filteredRoots, expandedIds: filterExpandedIds } = useMemo(
        () => filterCategoryTree(tree, filters.search, filters.scope),
        [tree, filters.search, filters.scope],
    );

    const effectiveExpandedIds = useMemo(() => {
        const merged = new Set(expandedIds);

        filterExpandedIds.forEach((id) => merged.add(id));

        return merged;
    }, [expandedIds, filterExpandedIds]);

    const flatRows = useMemo(
        () => flattenCategoryTree(filteredRoots, effectiveExpandedIds),
        [filteredRoots, effectiveExpandedIds],
    );

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.categories'), href: '/admin/categories' },
        ],
    });

    const applyFilters = useCallback(
        (next: { search?: string; scope?: CategoryScope }) => {
            router.get(
                '/admin/categories',
                {
                    search: next.search ?? filters.search ?? undefined,
                    scope: next.scope ?? filters.scope ?? undefined,
                },
                { preserveState: true, replace: true, onStart, onFinish },
            );
        },
        [filters.scope, filters.search, onStart, onFinish],
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                applyFilters({ search });
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters.search, applyFilters]);

    const toggleExpand = (id: number) => {
        setExpandedIds((current) => {
            const next = new Set(current);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const destroy = () => {
        if (deleteId === null) {
            return;
        }

        router.delete(`/admin/categories/${deleteId}`, {
            onFinish: () => setDeleteId(null),
        });
    };

    const scopeOptions: { value: CategoryScope; label: string }[] = [
        { value: 'all', label: tCommon('all') },
        { value: 'roots', label: t('categories.filterRoots') },
        { value: 'children', label: t('categories.filterChildren') },
    ];

    const hasCategories = stats.total > 0;
    const hasFilteredResults = flatRows.length > 0;

    return (
        <>
            <Head title={t('categories.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('categories.title')}
                    subtitle={t('categories.description')}
                    actions={
                        <AdminButton asChild>
                            <Link href="/admin/categories/create">
                                {t('categories.new')}
                            </Link>
                        </AdminButton>
                    }
                />

                {hasCategories && (
                    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
                        <AdminStatCard
                            label={t('categories.statsTotal')}
                            value={stats.total}
                        />
                        <AdminStatCard
                            label={t('categories.statsRoots')}
                            value={stats.roots}
                        />
                        <AdminStatCard
                            label={t('categories.statsMissingImages')}
                            value={stats.missingImages}
                        />
                    </div>
                )}

                {hasCategories && (
                    <div className="flex flex-wrap items-end gap-4">
                        <AdminInputField
                            label={tCommon('search')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={t('categories.searchPlaceholder')}
                            className="min-w-[220px] flex-1"
                            disabled={isPending}
                        />
                        <div className="space-y-1.5">
                            <p className="admin-label">
                                {t('categories.filterLabel')}
                            </p>
                            <AdminFilterTabs
                                value={filters.scope}
                                onChange={(value) =>
                                    applyFilters({
                                        scope: (value ??
                                            'all') as CategoryScope,
                                    })
                                }
                                options={scopeOptions}
                                disabled={isPending}
                            />
                        </div>
                    </div>
                )}

                {errors.category && (
                    <div
                        className="rounded-admin-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        role="alert"
                    >
                        {errors.category}
                    </div>
                )}

                {!hasCategories ? (
                    <AdminEmptyState
                        title={t('categories.emptyTitle')}
                        description={t('categories.emptyDescription')}
                        action={
                            <AdminButton asChild variant="secondary">
                                <Link href="/admin/categories/create">
                                    {t('categories.new')}
                                </Link>
                            </AdminButton>
                        }
                    />
                ) : !hasFilteredResults ? (
                    <AdminEmptyState
                        title={t('categories.noResultsTitle')}
                        description={t('categories.noResultsDescription')}
                    />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <CategoryTreeTable
                                rows={flatRows}
                                onToggleExpand={toggleExpand}
                                onDelete={setDeleteId}
                            />
                        </div>
                        <CategoryTreeCards
                            roots={filteredRoots}
                            onDelete={setDeleteId}
                        />
                    </>
                )}
            </div>

            <AdminConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title={t('categories.deleteConfirm')}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={destroy}
            />
        </>
    );
}
