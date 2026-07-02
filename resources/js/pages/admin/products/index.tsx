import { Head, Link, router, setLayoutProps } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminInputField } from '@/components/admin/admin-field';
import {
    AdminConfirmDialog,
    AdminStockBadge,
    getStockStatus,
} from '@/components/admin/admin-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { AdminEmptyState } from '@/components/admin/ui/admin-empty-state';
import { AdminPagination } from '@/components/admin/ui/admin-pagination';

type ProductRow = {
    id: number;
    name: string;
    slug: string;
    styleCode: string;
    category: string | null;
    categoryId: number;
    colorwaysCount: number;
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
                { preserveState: true, replace: true },
            );
        },
        [filters.category, filters.search],
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search !== (filters.search ?? '')) {
                applyFilters({ search });
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters.search, applyFilters]);

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
                    />
                    <div className="space-y-1.5">
                        <label className="admin-label">
                            {t('products.category')}
                        </label>
                        <select
                            value={filters.category ?? ''}
                            onChange={(e) =>
                                applyFilters({
                                    category: e.target.value
                                        ? Number(e.target.value)
                                        : null,
                                })
                            }
                            className="border-admin h-9 min-w-[180px] rounded-md border bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-primary)] outline-none focus-visible:border-[var(--admin-tertiary)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--admin-tertiary)_25%,transparent)]"
                        >
                            <option value="">{tCommon('all')}</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {products.data.length === 0 ? (
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
                    <div className="border-admin overflow-hidden rounded-lg border bg-[var(--admin-surface)] shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left">
                                <thead>
                                    <tr className="border-admin text-admin-secondary border-b bg-[var(--admin-neutral)] text-xs font-medium">
                                        <th className="px-4 py-3">
                                            {t('products.name')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('products.style')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('products.category')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('products.stock')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('products.colorways')}
                                        </th>
                                        <th className="px-4 py-3">
                                            {t('products.featured')}
                                        </th>
                                        <th className="px-4 py-3 text-right">
                                            {tCommon('actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="border-admin cursor-pointer border-b hover:bg-[var(--admin-neutral)]"
                                            onClick={() =>
                                                router.visit(
                                                    `/admin/products/${product.slug}/edit`,
                                                )
                                            }
                                        >
                                            <td className="px-4 py-3">
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
                                            </td>
                                            <td className="text-admin-secondary px-4 py-2.5 text-sm">
                                                {product.styleCode}
                                            </td>
                                            <td className="text-admin-secondary px-4 py-2.5 text-sm">
                                                {product.category ??
                                                    tCommon('emDash')}
                                            </td>
                                            <td className="px-4 py-3">
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
                                            </td>
                                            <td className="text-admin-secondary px-4 py-2.5 text-sm">
                                                {product.colorwaysCount}
                                            </td>
                                            <td
                                                className="px-4 py-3"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={product.isFeatured}
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
                                            </td>
                                            <td
                                                className="px-4 py-3 text-right"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/products/${product.slug}/edit`}
                                                        className="text-admin-secondary text-sm hover:text-[var(--admin-primary)] hover:underline"
                                                    >
                                                        {t('products.edit')}
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteSlug(
                                                                product.slug,
                                                            )
                                                        }
                                                        className="text-sm text-red-600 hover:underline"
                                                    >
                                                        {t('products.delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
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
        </>
    );
}
