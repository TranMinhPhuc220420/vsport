import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { SizeGuideFormFields } from '@/components/admin/size-guide-form-fields';
import type { SizeGuideFormData } from '@/components/admin/size-guide-form-fields';

type SizeGuideFormProps = {
    mode: 'create' | 'edit';
    action: string;
    method: 'post' | 'put';
    categories: { id: number; name: string }[];
    brands: { id: number; name: string }[];
    initial: SizeGuideFormData;
};

export function SizeGuideForm({
    mode,
    action,
    method,
    categories,
    brands,
    initial,
}: SizeGuideFormProps) {
    const { t } = useTranslation('admin');

    const title =
        mode === 'create'
            ? t('sizeGuides.newTitle')
            : t('sizeGuides.editTitle');
    const submitLabel =
        mode === 'create' ? t('sizeGuides.create') : t('sizeGuides.save');

    return (
        <>
            <Head title={title} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/size-guides"
                    backLabel={t('sizeGuides.back')}
                    title={title}
                />

                <SizeGuideFormFields
                    action={action}
                    method={method}
                    categories={categories}
                    brands={brands}
                    initial={initial}
                    submitLabel={submitLabel}
                    sectionTitle={title}
                />
            </div>
        </>
    );
}
