import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { AdminInputField, AdminTextareaField } from '@/components/admin/admin-field';
import {
    AdminFormErrorSummary,
    notifyAdminFormValidationError,
} from '@/components/admin/admin-form-error-summary';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';

type BlogCategoryFormProps = {
    mode: 'create' | 'edit';
    action: string;
    method: 'post' | 'put';
    initial: {
        name: string;
        slug: string;
        description: string;
        sortOrder: number | string;
    };
};

export function BlogCategoryForm({
    mode,
    action,
    method,
    initial,
}: BlogCategoryFormProps) {
    const { t } = useTranslation('admin');
    const { data, setData, processing, errors, post, put } = useForm(initial);

    const title =
        mode === 'create'
            ? t('blogCategories.newTitle')
            : t('blogCategories.editTitle');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const onError = () => {
            notifyAdminFormValidationError(t('form.validationFailed'));
        };

        if (method === 'put') {
            put(action, { onError });

            return;
        }

        post(action, { onError });
    };

    return (
        <>
            <Head title={title} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/blog-categories"
                    backLabel={t('blogCategories.back')}
                    title={title}
                />

                <form onSubmit={handleSubmit} className="w-[600px]">
                    <AdminFormErrorSummary errors={errors} />

                    <AdminFormSection title={title}>
                        <AdminInputField
                            label={t('blogCategories.name')}
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            error={errors.name}
                        />
                        <AdminInputField
                            label={t('blogCategories.slug')}
                            value={data.slug}
                            onChange={(event) =>
                                setData('slug', event.target.value)
                            }
                            error={errors.slug}
                        />
                        <AdminTextareaField
                            label={t('blogCategories.descriptionLabel')}
                            value={data.description}
                            onChange={(event) =>
                                setData('description', event.target.value)
                            }
                            rows={3}
                            error={errors.description}
                        />
                        <AdminInputField
                            label={t('blogCategories.sortOrder')}
                            type="number"
                            min="0"
                            value={data.sortOrder}
                            onChange={(event) =>
                                setData('sortOrder', event.target.value)
                            }
                            error={errors.sortOrder}
                        />
                        <AdminButton type="submit" disabled={processing}>
                            {mode === 'create'
                                ? t('blogCategories.create')
                                : t('blogCategories.save')}
                        </AdminButton>
                    </AdminFormSection>
                </form>
            </div>
        </>
    );
}
