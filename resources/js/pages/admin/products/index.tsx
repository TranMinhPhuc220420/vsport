import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
} from '@/components/admin/admin-field';
import {
    AdminConfirmDialog,
    AdminStockBadge,
    getStockStatus,
} from '@/components/admin/admin-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminBulkActionBar } from '@/components/admin/ui/admin-bulk-action-bar';
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
    AdminDataTableSelectCell,
} from '@/components/admin/ui/admin-data-table';
import { AdminEmptyState } from '@/components/admin/ui/admin-empty-state';
import { adminSelectClassName } from '@/components/admin/ui/admin-input-styles';
import { AdminPagination } from '@/components/admin/ui/admin-pagination';
import { AdminRowActionLink } from '@/components/admin/ui/admin-row-action-link';
import { AdminSkeletonRows } from '@/components/admin/ui/admin-skeleton-rows';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdminFilterPending } from '@/hooks/use-admin-filter-pending';
import { useRowSelection } from '@/hooks/use-row-selection';

type ProductRow = {
    id: number;
    name: string;
    slug: string;
    styleCode: string;
    category: string | null;
    categoryId: number;
    variantsCount: number;
    thumbnailUrl: string | null;
    totalStock: number;
    lowStock: boolean;
    isActive: boolean;
    isFeatured: boolean;
};

type AdminProductsIndexProps = {
    products: {
        data: ProductRow[];
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
        search: string | null;
        category: number | null;
    };
    categories: { id: number; name: string }[];
};

export default function AdminProductsIndex({
    products,
    filters,
    categories,
}: AdminProductsIndexProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const { isPending, onStart, onFinish } = useAdminFilterPending();
    const selection = useRowSelection(products.data);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.products'), href: '/admin/products' },
        ],
    });

    const applyFilters = useCallback(
        (next: { search?: string; category?: number | null }) => {
            router.get(
                '/admin/products',
                {
                    search: next.search ?? filters.search ?? undefined,
                    category:
                        next.category !== undefined
                            ? (next.category ?? undefined)
                            : (filters.category ?? undefined),
                },
                { preserveState: true, replace: true, onStart, onFinish },
            );
        },
        [filters.category, filters.search, onStart, onFinish],
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                applyFilters({ search });
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters.search, applyFilters]);

    useEffect(() => {
        selection.clear();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products.meta.current_page, filters.search, filters.category]);

    const destroy = () => {
        if (!deleteSlug) {
            return;
        }

        router.delete(`/admin/products/${deleteSlug}`, {
            onFinish: () => setDeleteSlug(null),
        });
    };

    const toggleFeatured = (slug: string, isFeatured: boolean) => {
        router.patch(
            `/admin/products/${slug}/featured`,
            { is_featured: !isFeatured },
            { preserveScroll: true, preserveState: true },
        );
    };

    const selectedIds = Array.from(selection.selectedIds);

    const bulkSetFeatured = (isFeatured: boolean) => {
        router.patch(
            '/admin/products/bulk-featured',
            { ids: selectedIds, is_featured: isFeatured },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => selection.clear(),
            },
        );
    };

    const bulkAssignCategory = (categoryId: number) => {
        router.patch(
            '/admin/products/bulk-category',
            { ids: selectedIds, category_id: categoryId },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => selection.clear(),
            },
        );
    };

    const bulkDestroy = () => {
        router.post(
            '/admin/products/bulk-delete',
            { ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => selection.clear(),
                onFinish: () => setBulkDeleteOpen(false),
            },
        );
    };

    return (
        <>
            <Head title={t('products.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('products.title')}
                    subtitle={t('products.description')}
                    actions={
                        <AdminButton asChild>
                            <Link href="/admin/products/create">
                                {t('products.new')}
                            </Link>
                        </AdminButton>
                    }
                />

                <div className="flex flex-wrap items-end gap-4">
                    <AdminInputField
                        label={tCommon('search')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t('products.searchPlaceholder')}
                        className="min-w-[220px] flex-1"
                        disabled={isPending}
                    />
                    <AdminSelectField
                        label={t('products.category')}
                        value={filters.category ?? ''}
                        onChange={(value) =>
                            applyFilters({
                                category: value ? Number(value) : null,
                            })
                        }
                        options={[
                            { value: '', label: tCommon('all') },
                            ...categories.map((category) => ({
                                value: category.id,
                                label: category.name,
                            })),
                        ]}
                        className="min-w-[180px]"
                        disabled={isPending}
                    />
                </div>

                <AdminBulkActionBar
                    selectedCount={selection.selectedCount}
                    onClear={selection.clear}
                    actions={
                        <>
                            <AdminButton
                                variant="secondary"
                                size="sm"
                                onClick={() => bulkSetFeatured(true)}
                            >
                                {t('bulkActions.markFeatured')}
                            </AdminButton>
                            <AdminButton
                                variant="secondary"
                                size="sm"
                                onClick={() => bulkSetFeatured(false)}
                            >
                                {t('bulkActions.unmarkFeatured')}
                            </AdminButton>
                            <select
                                defaultValue=""
                                onChange={(e) => {
                                    if (e.target.value) {
                                        bulkAssignCategory(
                                            Number(e.target.value),
                                        );
                                        e.target.value = '';
                                    }
                                }}
                                className={`${adminSelectClassName} h-8 w-auto text-xs`}
                            >
                                <option value="" disabled>
                                    {t('bulkActions.assignCategory')}
                                </option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <AdminButton
                                variant="destructive"
                                size="sm"
                                onClick={() => setBulkDeleteOpen(true)}
                            >
                                {t('bulkActions.delete')}
                            </AdminButton>
                        </>
                    }
                />

                {!isPending && products.data.length === 0 ? (
                    <AdminEmptyState
                        title={t('products.emptyTitle')}
                        description={t('products.emptyDescription')}
                        action={
                            <AdminButton asChild variant="secondary">
                                <Link href="/admin/products/create">
                                    {t('products.emptyCta')}
                                </Link>
                            </AdminButton>
                        }
                    />
                ) : (
                    <>
                        <div className="hidden md:block">
                            <AdminDataTable minWidth="800px">
                                <AdminDataTableHead>
                                    <AdminDataTableHeaderRow>
                                        <AdminDataTableSelectCell
                                            header
                                            checked={
                                                selection.allSelected
                                                    ? true
                                                    : selection.someSelected
                                                      ? 'indeterminate'
                                                      : false
                                            }
                                            onCheckedChange={
                                                selection.toggleAll
                                            }
                                            label={t('products.selectAll')}
                                        />
                                        <AdminDataTableHeaderCell>
                                            {t('products.name')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('products.style')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('products.category')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('products.stock')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('products.tabOptions')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell>
                                            {t('products.featured')}
                                        </AdminDataTableHeaderCell>
                                        <AdminDataTableHeaderCell align="right">
                                            {tCommon('actions')}
                                        </AdminDataTableHeaderCell>
                                    </AdminDataTableHeaderRow>
                                </AdminDataTableHead>
                                <AdminDataTableBody>
                                    {isPending ? (
                                        <AdminSkeletonRows columns={8} />
                                    ) : (
                                        products.data.map((product) => (
                                            <AdminDataTableRow
                                                key={product.id}
                                                onClick={() =>
                                                    router.visit(
                                                        `/admin/products/${product.slug}/edit`,
                                                    )
                                                }
                                            >
                                                <AdminDataTableSelectCell
                                                    checked={selection.isSelected(
                                                        product.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        selection.toggle(
                                                            product.id,
                                                        )
                                                    }
                                                    label={t(
                                                        'products.selectRow',
                                                        { name: product.name },
                                                    )}
                                                    className="cursor-default"
                                                />
                                                <AdminDataTableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="border-admin flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-[var(--admin-neutral)]">
                                                            {product.thumbnailUrl ? (
                                                                <img
                                                                    src={
                                                                        product.thumbnailUrl
                                                                    }
                                                                    alt=""
                                                                    className="size-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-admin-secondary text-xs">
                                                                    {tCommon(
                                                                        'noImage',
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-[var(--admin-primary)]">
                                                            {product.name}
                                                        </span>
                                                    </div>
                                                </AdminDataTableCell>
                                                <AdminDataTableCell className="text-admin-secondary">
                                                    {product.styleCode}
                                                </AdminDataTableCell>
                                                <AdminDataTableCell className="text-admin-secondary">
                                                    {product.category ??
                                                        tCommon('emDash')}
                                                </AdminDataTableCell>
                                                <AdminDataTableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-admin-secondary text-sm">
                                                            {product.totalStock}
                                                        </span>
                                                        <AdminStockBadge
                                                            status={getStockStatus(
                                                                product.totalStock,
                                                            )}
                                                        />
                                                    </div>
                                                </AdminDataTableCell>
                                                <AdminDataTableCell className="text-admin-secondary">
                                                    {t(
                                                        'products.variantsCount',
                                                        {
                                                            count: product.variantsCount,
                                                        },
                                                    )}
                                                </AdminDataTableCell>
                                                <AdminDataTableCell>
                                                    <div
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                product.isFeatured
                                                            }
                                                            aria-label={t(
                                                                'products.toggleFeatured',
                                                            )}
                                                            onChange={() =>
                                                                toggleFeatured(
                                                                    product.slug,
                                                                    product.isFeatured,
                                                                )
                                                            }
                                                            className="border-admin size-4 rounded accent-[var(--admin-tertiary)]"
                                                        />
                                                    </div>
                                                </AdminDataTableCell>
                                                <AdminDataTableCell align="right">
                                                    <div
                                                        className="flex justify-end gap-2"
                                                        onClick={(e) =>
                                                            e.stopPropagation()
                                                        }
                                                    >
                                                        <AdminRowActionLink
                                                            href={`/admin/products/${product.slug}/edit`}
                                                        >
                                                            {t('products.edit')}
                                                        </AdminRowActionLink>
                                                        <AdminRowActionLink
                                                            variant="danger"
                                                            onClick={() =>
                                                                setDeleteSlug(
                                                                    product.slug,
                                                                )
                                                            }
                                                        >
                                                            {t(
                                                                'products.delete',
                                                            )}
                                                        </AdminRowActionLink>
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
                                products.data.map((product) => (
                                    <AdminCardListItem
                                        key={product.id}
                                        title={product.name}
                                        subtitle={product.styleCode}
                                        leading={
                                            <Checkbox
                                                checked={selection.isSelected(
                                                    product.id,
                                                )}
                                                onCheckedChange={() =>
                                                    selection.toggle(product.id)
                                                }
                                                aria-label={t(
                                                    'products.selectRow',
                                                    { name: product.name },
                                                )}
                                                className="border-admin-strong mt-1 data-[state=checked]:border-[var(--admin-tertiary)] data-[state=checked]:bg-[var(--admin-tertiary)]"
                                            />
                                        }
                                        badge={
                                            <AdminStockBadge
                                                status={getStockStatus(
                                                    product.totalStock,
                                                )}
                                            />
                                        }
                                        onClick={() =>
                                            router.visit(
                                                `/admin/products/${product.slug}/edit`,
                                            )
                                        }
                                        actions={
                                            <>
                                                <AdminRowActionLink
                                                    href={`/admin/products/${product.slug}/edit`}
                                                >
                                                    {t('products.edit')}
                                                </AdminRowActionLink>
                                                <AdminRowActionLink
                                                    variant="danger"
                                                    onClick={() =>
                                                        setDeleteSlug(
                                                            product.slug,
                                                        )
                                                    }
                                                >
                                                    {t('products.delete')}
                                                </AdminRowActionLink>
                                            </>
                                        }
                                    >
                                        <AdminCardListField
                                            label={t('products.category')}
                                        >
                                            {product.category ??
                                                tCommon('emDash')}
                                        </AdminCardListField>
                                        <AdminCardListField
                                            label={t('products.stock')}
                                        >
                                            {product.totalStock}
                                        </AdminCardListField>
                                        <AdminCardListField
                                            label={t('products.tabOptions')}
                                        >
                                            {product.variantsCount}
                                        </AdminCardListField>
                                        <AdminCardListField
                                            label={t('products.featured')}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={product.isFeatured}
                                                aria-label={t(
                                                    'products.toggleFeatured',
                                                )}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                                onChange={() =>
                                                    toggleFeatured(
                                                        product.slug,
                                                        product.isFeatured,
                                                    )
                                                }
                                                className="border-admin size-4 rounded accent-[var(--admin-tertiary)]"
                                            />
                                        </AdminCardListField>
                                    </AdminCardListItem>
                                ))
                            )}
                        </AdminCardList>
                    </>
                )}

                <AdminPagination
                    links={products.links}
                    meta={{
                        current_page: products.meta.current_page,
                        from: null,
                        last_page: products.meta.last_page,
                        per_page: 15,
                        to: null,
                        total: products.meta.total,
                    }}
                />
            </div>

            <AdminConfirmDialog
                open={deleteSlug !== null}
                onOpenChange={(open) => !open && setDeleteSlug(null)}
                title={t('products.deleteConfirm')}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={destroy}
            />

            <AdminConfirmDialog
                open={bulkDeleteOpen}
                onOpenChange={setBulkDeleteOpen}
                title={t('bulkActions.deleteConfirm', {
                    count: selectedIds.length,
                })}
                variant="destructive"
                confirmLabel={tCommon('delete')}
                onConfirm={bulkDestroy}
            />
        </>
    );
}
