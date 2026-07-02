import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
} from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';

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
    const { data, setData, processing, errors, post, put } = useForm(initial);

    const title =
        mode === 'create'
            ? t('categories.newTitle')
            : t('categories.editTitle');
    const submitLabel =
        mode === 'create' ? t('categories.create') : t('categories.save');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (method === 'put') {
            put(action);

            return;
        }

        post(action);
    };

    return (
        <>
            <Head title={title} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/categories"
                    backLabel={t('categories.back')}
                    title={title}
                />

                <form onSubmit={handleSubmit} className="max-w-96">
                    <AdminFormSection title={title}>
                        <AdminInputField
                            label={t('products.name')}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                        />
                        <AdminInputField
                            label={t('products.slug')}
                            value={data.slug}
                            onChange={(e) => setData('slug', e.target.value)}
                            error={errors.slug}
                        />
                        <AdminSelectField
                            label={t('categories.parentCategory')}
                            value={data.parent_id}
                            onChange={(value) =>
                                setData(
                                    'parent_id',
                                    value === '' ? '' : Number(value),
                                )
                            }
                            options={[
                                {
                                    value: '',
                                    label: t('categories.noneTopLevel'),
                                },
                                ...parentCategories.map((parent) => ({
                                    value: parent.id,
                                    label: parent.name,
                                })),
                            ]}
                            error={errors.parent_id}
                        />

                        {(errors as Record<string, string | undefined>)
                            .category && (
                            <p className="admin-caption text-red-600">
                                {(errors as Record<string, string>).category}
                            </p>
                        )}

                        <AdminButton type="submit" disabled={processing}>
                            {submitLabel}
                        </AdminButton>
                    </AdminFormSection>
                </form>
            </div>
        </>
    );
}
