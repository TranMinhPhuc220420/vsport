import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { CategoryFormFields } from '@/components/admin/category-form-fields';
import { AdminPageHeader } from '@/components/admin/admin-page-header';

type CategoryFormProps = {
    mode: 'create' | 'edit';
    action: string;
    method: 'post' | 'put';
    parentCategories: { id: number; name: string }[];
    initial: {
        name: string;
        slug: string;
        parent_id: number | '';
    };
};

export function CategoryForm({
    mode,
    action,
    method,
    parentCategories,
    initial,
}: CategoryFormProps) {
    const { t } = useTranslation('admin');

    const title =
        mode === 'create'
            ? t('categories.newTitle')
            : t('categories.editTitle');
    const submitLabel =
        mode === 'create' ? t('categories.create') : t('categories.save');

    return (
        <>
            <Head title={title} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/categories"
                    backLabel={t('categories.back')}
                    title={title}
                />

                <CategoryFormFields
                    action={action}
                    method={method}
                    parentCategories={parentCategories}
                    initial={initial}
                    submitLabel={submitLabel}
                    sectionTitle={title}
                />
            </div>
        </>
    );
}
