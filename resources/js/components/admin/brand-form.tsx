import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { AdminInputField } from '@/components/admin/admin-field';
import {
    AdminFormErrorSummary,
    notifyAdminFormValidationError,
} from '@/components/admin/admin-form-error-summary';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';

type BrandFormProps = {
    mode: 'create' | 'edit';
    action: string;
    method: 'post' | 'put';
    initial: {
        name: string;
        slug: string;
    };
};

export function BrandForm({ mode, action, method, initial }: BrandFormProps) {
    const { t } = useTranslation('admin');
    const { data, setData, processing, errors, post, put } = useForm(initial);

    const title =
        mode === 'create' ? t('brands.newTitle') : t('brands.editTitle');

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
                    backHref="/admin/brands"
                    backLabel={t('brands.back')}
                    title={title}
                />

                <form onSubmit={handleSubmit} className="w-[600px]">
                    <AdminFormErrorSummary errors={errors} />

                    <AdminFormSection title={title}>
                        <AdminInputField
                            label={t('brands.name')}
                            value={data.name}
                            onChange={(event) =>
                                setData('name', event.target.value)
                            }
                            error={errors.name}
                        />
                        <AdminInputField
                            label={t('brands.slug')}
                            value={data.slug}
                            onChange={(event) =>
                                setData('slug', event.target.value)
                            }
                            error={errors.slug}
                        />
                        <AdminButton type="submit" disabled={processing}>
                            {mode === 'create'
                                ? t('brands.create')
                                : t('brands.save')}
                        </AdminButton>
                    </AdminFormSection>
                </form>
            </div>
        </>
    );
}
