import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
} from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';

export type CategoryFormData = {
    name: string;
    slug: string;
    parent_id: number | '';
};

type CategoryFormFieldsProps = {
    action: string;
    method: 'post' | 'put';
    parentCategories: { id: number; name: string }[];
    initial: CategoryFormData;
    submitLabel: string;
    sectionTitle?: string;
};

export function CategoryFormFields({
    action,
    method,
    parentCategories,
    initial,
    submitLabel,
    sectionTitle,
}: CategoryFormFieldsProps) {
    const { t } = useTranslation('admin');
    const { data, setData, processing, errors, post, put } = useForm(initial);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        if (method === 'put') {
            put(action);

            return;
        }

        post(action);
    };

    return (
        <form onSubmit={handleSubmit}>
            <AdminFormSection title={sectionTitle ?? t('categories.detailsTitle')}>
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
                    hint={t('categories.slugHint')}
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

                {(errors as Record<string, string | undefined>).category && (
                    <p className="admin-caption text-red-600">
                        {(errors as Record<string, string>).category}
                    </p>
                )}

                <AdminButton type="submit" disabled={processing}>
                    {submitLabel}
                </AdminButton>
            </AdminFormSection>
        </form>
    );
}
