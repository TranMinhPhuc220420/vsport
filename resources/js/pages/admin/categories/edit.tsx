import { Head, Link, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminTabs } from '@/components/admin/admin-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { CategoryFormFields } from '@/components/admin/category-form-fields';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { CategoryChildrenPanel } from '@/pages/admin/categories/components/category-children-panel';
import { CategoryImageEditor } from '@/pages/admin/categories/components/category-image-editor';
import { CategoryOptionTemplatesEditor } from '@/pages/admin/categories/components/category-option-templates-editor';

type CategoryChild = {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string | null;
    productsCount: number;
};

type AdminCategoriesEditProps = {
    category: {
        id: number;
        name: string;
        slug: string;
        parentId: number | null;
        imageUrl?: string | null;
        imageAlt?: string | null;
        productsCount: number;
        childrenCount: number;
        parentName?: string | null;
    };
    children: CategoryChild[];
    parentCategories: { id: number; name: string }[];
    optionTemplates: Array<{
        id: number;
        name: string;
        position: number;
        displayType: string;
        isRequired: boolean;
        drivesGallery: boolean;
        defaultValues: string[];
    }>;
    activeTab?: string;
};

export default function AdminCategoriesEdit({
    category,
    children,
    parentCategories,
    optionTemplates,
    activeTab = 'details',
}: AdminCategoriesEditProps) {
    const { t } = useTranslation('admin');
    const [tab, setTab] = useState(activeTab);
    const [prevActiveTab, setPrevActiveTab] = useState(activeTab);

    if (activeTab !== prevActiveTab) {
        setPrevActiveTab(activeTab);
        setTab(activeTab);
    }

    const isRoot = category.parentId === null;
    const hasImage = Boolean(category.imageUrl);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.categories'), href: '/admin/categories' },
            { title: category.name, href: '#' },
        ],
    });

    return (
        <>
            <Head title={category.name} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/categories"
                    backLabel={t('categories.back')}
                    title={category.name}
                    subtitle={`/${category.slug}`}
                    sticky
                    badges={
                        <>
                            {isRoot ? (
                                <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
                                    {t('categories.topLevel')}
                                </span>
                            ) : (
                                <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
                                    {t('categories.subcategoryOf', {
                                        parent: category.parentName ?? '—',
                                    })}
                                </span>
                            )}
                            <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
                                {t('categories.productCount', {
                                    count: category.productsCount,
                                })}
                            </span>
                            {isRoot && (
                                <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
                                    {t('categories.childCount', {
                                        count: category.childrenCount,
                                    })}
                                </span>
                            )}
                            <span className="border-admin text-admin-secondary inline-flex items-center rounded-md border bg-[var(--admin-neutral)] px-2 py-1 text-xs">
                                {hasImage
                                    ? t('categories.hasImage')
                                    : t('categories.missingImage')}
                            </span>
                        </>
                    }
                    actions={
                        <div className="flex flex-wrap gap-2">
                            {isRoot && (
                                <AdminButton asChild variant="secondary">
                                    <Link
                                        href={`/admin/categories/create?parent_id=${category.id}`}
                                    >
                                        {t('categories.addSubcategory')}
                                    </Link>
                                </AdminButton>
                            )}
                            <AdminButton asChild variant="secondary">
                                <Link
                                    href={`/${category.slug}`}
                                    target="_blank"
                                >
                                    {t('categories.viewStorefront')}
                                </Link>
                            </AdminButton>
                        </div>
                    }
                />

                <AdminTabs
                    value={tab}
                    onValueChange={setTab}
                    tabs={[
                        {
                            value: 'details',
                            label: t('categories.tabDetails'),
                            content: (
                                <div className="grid grid-cols-1 gap-6 desktop:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] desktop:items-start">
                                    <CategoryFormFields
                                        action={`/admin/categories/${category.id}`}
                                        method="put"
                                        parentCategories={parentCategories}
                                        initial={{
                                            name: category.name,
                                            slug: category.slug,
                                            parent_id: category.parentId ?? '',
                                        }}
                                        submitLabel={t('categories.save')}
                                    />
                                    {isRoot && (
                                        <CategoryChildrenPanel
                                            categoryId={category.id}
                                            children={children}
                                        />
                                    )}
                                </div>
                            ),
                        },
                        {
                            value: 'image',
                            label: t('categories.tabImage'),
                            content: (
                                <CategoryImageEditor
                                    categoryId={category.id}
                                    initialImageUrl={category.imageUrl ?? null}
                                    initialImageAlt={category.imageAlt ?? null}
                                    categoryName={category.name}
                                />
                            ),
                        },
                        {
                            value: 'templates',
                            label: t('categories.tabTemplates'),
                            content: (
                                <CategoryOptionTemplatesEditor
                                    categoryId={category.id}
                                    templates={optionTemplates}
                                />
                            ),
                        },
                    ]}
                />
            </div>
        </>
    );
}
