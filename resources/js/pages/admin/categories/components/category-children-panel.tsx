import { Link } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';

type CategoryChild = {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string | null;
    productsCount: number;
};

type CategoryChildrenPanelProps = {
    categoryId: number;
    children: CategoryChild[];
};

export function CategoryChildrenPanel({
    categoryId,
    children,
}: CategoryChildrenPanelProps) {
    const { t } = useTranslation('admin');

    if (children.length === 0) {
        return (
            <AdminFormSection title={t('categories.subcategories')}>
                <p className="admin-caption text-admin-secondary -mt-2">
                    {t('categories.noSubcategories')}
                </p>
                <AdminButton asChild variant="secondary">
                    <Link
                        href={`/admin/categories/create?parent_id=${categoryId}`}
                    >
                        {t('categories.addSubcategory')}
                    </Link>
                </AdminButton>
            </AdminFormSection>
        );
    }

    return (
        <AdminFormSection title={t('categories.subcategories')}>
            <p className="admin-caption text-admin-secondary -mt-2">
                {t('categories.subcategoriesHint')}
            </p>
            <ul className="divide-admin rounded-admin-lg border-admin divide-y overflow-hidden border">
                {children.map((child) => (
                    <li
                        key={child.id}
                        className="flex items-center gap-4 bg-[var(--admin-surface)] px-4 py-3"
                    >
                        <div className="rounded-admin-md size-12 shrink-0 overflow-hidden bg-[var(--admin-neutral)]">
                            {child.imageUrl ? (
                                <img
                                    src={child.imageUrl}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="text-admin-secondary flex size-full items-center justify-center">
                                    <ImageIcon className="size-4 opacity-50" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="admin-body-strong truncate text-[var(--admin-primary)]">
                                {child.name}
                            </p>
                            <p className="admin-caption text-admin-secondary">
                                /{child.slug} ·{' '}
                                {t('categories.productCount', {
                                    count: child.productsCount,
                                })}
                            </p>
                        </div>
                        <AdminButton asChild variant="ghost" size="sm">
                            <Link href={`/admin/categories/${child.id}/edit`}>
                                {t('categories.editChild')}
                            </Link>
                        </AdminButton>
                    </li>
                ))}
            </ul>
            <AdminButton asChild variant="secondary" className="mt-4">
                <Link href={`/admin/categories/create?parent_id=${categoryId}`}>
                    {t('categories.addSubcategory')}
                </Link>
            </AdminButton>
        </AdminFormSection>
    );
}
