import { Link } from '@inertiajs/react';
import { ChevronDown, ChevronRight, ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    AdminCardList,
    AdminCardListField,
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
import { AdminRowActionLink } from '@/components/admin/ui/admin-row-action-link';
import type {
    CategoryTreeNode,
    FlatCategoryTreeRow,
} from '@/lib/category-tree';
import { cn } from '@/lib/utils';

type CategoryTreeTableProps = {
    rows: FlatCategoryTreeRow[];
    onToggleExpand: (id: number) => void;
    onDelete: (id: number) => void;
};

function CategoryThumbnail({
    name,
    imageUrl,
    imageAlt,
}: {
    name: string;
    imageUrl?: string | null;
    imageAlt?: string | null;
}) {
    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={imageAlt ?? name}
                className="rounded-admin-sm border-admin size-10 shrink-0 border object-cover"
            />
        );
    }

    return (
        <div className="border-admin rounded-admin-sm flex size-10 shrink-0 items-center justify-center border bg-[var(--admin-neutral)]">
            <ImageIcon
                className="text-admin-secondary size-4"
                aria-hidden="true"
            />
        </div>
    );
}

function StructureBadge({
    depth,
    parentName,
}: {
    depth: number;
    parentName?: string | null;
}) {
    const { t } = useTranslation('admin');

    if (depth === 0) {
        return (
            <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
                {t('categories.topLevel')}
            </span>
        );
    }

    return (
        <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
            {t('categories.subcategoryOf', { parent: parentName ?? '—' })}
        </span>
    );
}

function ImageStatusBadge({ hasImage }: { hasImage: boolean }) {
    const { t } = useTranslation('admin');

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                hasImage
                    ? 'bg-[var(--admin-success-soft)] text-[var(--admin-success)]'
                    : 'bg-[var(--admin-warning-soft)] text-[var(--admin-warning)]',
            )}
        >
            <span
                className={cn(
                    'size-1.5 rounded-full',
                    hasImage
                        ? 'bg-[var(--admin-success)]'
                        : 'bg-[var(--admin-warning)]',
                )}
            />
            {hasImage ? t('categories.hasImage') : t('categories.missingImage')}
        </span>
    );
}

function canDeleteCategory(row: FlatCategoryTreeRow): boolean {
    return row.productsCount === 0 && row.childrenCount === 0;
}

function deleteBlockedReason(
    row: FlatCategoryTreeRow,
    t: (key: string) => string,
): string {
    if (row.productsCount > 0 && row.childrenCount > 0) {
        return t('categories.deleteBlockedBoth');
    }

    if (row.productsCount > 0) {
        return t('categories.deleteBlockedProducts');
    }

    return t('categories.deleteBlockedChildren');
}

function CategoryRowActions({
    row,
    onDelete,
}: {
    row: FlatCategoryTreeRow;
    onDelete: (id: number) => void;
}) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const deletable = canDeleteCategory(row);
    const blockedReason = deleteBlockedReason(row, t);

    return (
        <div className="flex justify-end gap-2">
            <AdminRowActionLink href={`/admin/categories/${row.id}/edit`}>
                {tCommon('edit')}
            </AdminRowActionLink>
            {row.depth === 0 && (
                <AdminRowActionLink
                    href={`/admin/categories/create?parent_id=${row.id}`}
                >
                    {t('categories.addSubcategory')}
                </AdminRowActionLink>
            )}
            {deletable ? (
                <AdminRowActionLink
                    variant="danger"
                    onClick={() => onDelete(row.id)}
                >
                    {tCommon('delete')}
                </AdminRowActionLink>
            ) : (
                <span
                    className="text-admin-secondary cursor-not-allowed text-sm opacity-60"
                    title={blockedReason}
                >
                    {tCommon('delete')}
                </span>
            )}
        </div>
    );
}

export function CategoryTreeTable({
    rows,
    onToggleExpand,
    onDelete,
}: CategoryTreeTableProps) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');

    return (
        <AdminDataTable>
            <AdminDataTableHead>
                <AdminDataTableHeaderRow>
                    <AdminDataTableHeaderCell>
                        {t('categories.columnCategory')}
                    </AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>
                        {t('categories.columnStructure')}
                    </AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>
                        {t('categories.columnCatalog')}
                    </AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell>
                        {t('categories.columnImage')}
                    </AdminDataTableHeaderCell>
                    <AdminDataTableHeaderCell className="text-right">
                        {tCommon('actions')}
                    </AdminDataTableHeaderCell>
                </AdminDataTableHeaderRow>
            </AdminDataTableHead>
            <AdminDataTableBody>
                {rows.map((row) => (
                    <AdminDataTableRow key={row.id}>
                        <AdminDataTableCell>
                            <div
                                className="flex min-w-0 items-center gap-3"
                                style={{
                                    paddingLeft: `${row.depth * 1.25}rem`,
                                }}
                            >
                                {row.hasChildren ? (
                                    <button
                                        type="button"
                                        onClick={() => onToggleExpand(row.id)}
                                        className="text-admin-secondary shrink-0 rounded p-0.5 hover:text-[var(--admin-primary)]"
                                        aria-expanded={row.isExpanded}
                                        aria-label={
                                            row.isExpanded
                                                ? t('categories.collapse')
                                                : t('categories.expand')
                                        }
                                    >
                                        {row.isExpanded ? (
                                            <ChevronDown className="size-4" />
                                        ) : (
                                            <ChevronRight className="size-4" />
                                        )}
                                    </button>
                                ) : (
                                    <span className="inline-block size-5 shrink-0" />
                                )}
                                <CategoryThumbnail
                                    name={row.name}
                                    imageUrl={row.imageUrl}
                                    imageAlt={row.imageAlt}
                                />
                                <div className="min-w-0">
                                    <Link
                                        href={`/admin/categories/${row.id}/edit`}
                                        className="font-medium text-[var(--admin-primary)] hover:underline"
                                    >
                                        {row.name}
                                    </Link>
                                    <p className="text-admin-secondary truncate text-xs">
                                        {row.slug}
                                    </p>
                                </div>
                            </div>
                        </AdminDataTableCell>
                        <AdminDataTableCell>
                            <StructureBadge
                                depth={row.depth}
                                parentName={row.parentName}
                            />
                        </AdminDataTableCell>
                        <AdminDataTableCell>
                            <div className="space-y-1 text-sm">
                                <div>
                                    <Link
                                        href={`/admin/products?category=${row.id}`}
                                        className="text-[var(--admin-primary)] hover:underline"
                                    >
                                        {t('categories.productCount', {
                                            count: row.productsCount,
                                        })}
                                    </Link>
                                </div>
                                {row.childrenCount > 0 && (
                                    <p className="text-admin-secondary text-xs">
                                        {t('categories.childCount', {
                                            count: row.childrenCount,
                                        })}
                                    </p>
                                )}
                            </div>
                        </AdminDataTableCell>
                        <AdminDataTableCell>
                            <ImageStatusBadge
                                hasImage={Boolean(row.imageUrl)}
                            />
                        </AdminDataTableCell>
                        <AdminDataTableCell className="text-right">
                            <CategoryRowActions row={row} onDelete={onDelete} />
                        </AdminDataTableCell>
                    </AdminDataTableRow>
                ))}
            </AdminDataTableBody>
        </AdminDataTable>
    );
}

type CategoryTreeCardsProps = {
    roots: CategoryTreeNode[];
    onDelete: (id: number) => void;
};

function CategoryTreeCardRow({
    row,
    depth,
    onDelete,
}: {
    row: CategoryTreeNode;
    depth: number;
    onDelete: (id: number) => void;
}) {
    const { t } = useTranslation('admin');
    const { t: tCommon } = useTranslation('common');
    const flatRow: FlatCategoryTreeRow = {
        ...row,
        depth,
        hasChildren: row.children.length > 0,
        isExpanded: true,
    };
    const deletable = canDeleteCategory(flatRow);

    return (
        <div
            className={cn(
                'border-admin rounded-admin-md space-y-3 border p-4',
                depth > 0 && 'ml-4',
            )}
        >
            <div className="flex items-start gap-3">
                <CategoryThumbnail
                    name={row.name}
                    imageUrl={row.imageUrl}
                    imageAlt={row.imageAlt}
                />
                <div className="min-w-0 flex-1">
                    <Link
                        href={`/admin/categories/${row.id}/edit`}
                        className="font-medium text-[var(--admin-primary)] hover:underline"
                    >
                        {row.name}
                    </Link>
                    <p className="text-admin-secondary text-xs">{row.slug}</p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <StructureBadge depth={depth} parentName={row.parentName} />
                <ImageStatusBadge hasImage={Boolean(row.imageUrl)} />
            </div>
            <AdminCardListField label={t('categories.products')}>
                <Link
                    href={`/admin/products?category=${row.id}`}
                    className="text-[var(--admin-primary)] hover:underline"
                >
                    {t('categories.productCount', {
                        count: row.productsCount,
                    })}
                </Link>
            </AdminCardListField>
            {row.childrenCount > 0 && (
                <AdminCardListField label={t('categories.subcategories')}>
                    {t('categories.childCount', {
                        count: row.childrenCount,
                    })}
                </AdminCardListField>
            )}
            <div className="flex flex-wrap gap-2">
                <AdminRowActionLink href={`/admin/categories/${row.id}/edit`}>
                    {tCommon('edit')}
                </AdminRowActionLink>
                {depth === 0 && (
                    <AdminRowActionLink
                        href={`/admin/categories/create?parent_id=${row.id}`}
                    >
                        {t('categories.addSubcategory')}
                    </AdminRowActionLink>
                )}
                {deletable ? (
                    <AdminRowActionLink
                        variant="danger"
                        onClick={() => onDelete(row.id)}
                    >
                        {tCommon('delete')}
                    </AdminRowActionLink>
                ) : (
                    <span
                        className="text-admin-secondary cursor-not-allowed text-sm opacity-60"
                        title={deleteBlockedReason(flatRow, t)}
                    >
                        {tCommon('delete')}
                    </span>
                )}
            </div>
            {row.children.length > 0 && (
                <div className="space-y-3 pt-1">
                    {row.children.map((child) => (
                        <CategoryTreeCardRow
                            key={child.id}
                            row={child}
                            depth={depth + 1}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function CategoryTreeCards({ roots, onDelete }: CategoryTreeCardsProps) {
    if (roots.length === 0) {
        return null;
    }

    return (
        <AdminCardList className="md:hidden">
            {roots.map((root) => (
                <CategoryTreeCardRow
                    key={root.id}
                    row={root}
                    depth={0}
                    onDelete={onDelete}
                />
            ))}
        </AdminCardList>
    );
}
