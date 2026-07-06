import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
} from '@/components/admin/admin-field';
import {
    AdminFormErrorSummary,
    notifyAdminFormValidationError,
} from '@/components/admin/admin-form-error-summary';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export type SizeGuideFormData = {
    name: string;
    category_id: number | '';
    brand_id: number | '';
    is_default: boolean;
};

type SizeGuideFormFieldsProps = {
    action: string;
    method: 'post' | 'put';
    categories: { id: number; name: string }[];
    brands: { id: number; name: string }[];
    initial: SizeGuideFormData;
    submitLabel: string;
    sectionTitle?: string;
};

export function SizeGuideFormFields({
    action,
    method,
    categories,
    brands,
    initial,
    submitLabel,
    sectionTitle,
}: SizeGuideFormFieldsProps) {
    const { t } = useTranslation('admin');
    const { data, setData, processing, errors, post, put } = useForm(initial);

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
        <form onSubmit={handleSubmit}>
            <AdminFormErrorSummary errors={errors} />

            <AdminFormSection
                title={sectionTitle ?? t('sizeGuides.tabDetails')}
            >
                <AdminInputField
                    label={t('sizeGuides.name')}
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                />
                <AdminSelectField
                    label={t('sizeGuides.category')}
                    value={data.category_id}
                    onChange={(value) =>
                        setData(
                            'category_id',
                            value === '' ? '' : Number(value),
                        )
                    }
                    options={[
                        { value: '', label: t('sizeGuides.noneCategory') },
                        ...categories.map((category) => ({
                            value: category.id,
                            label: category.name,
                        })),
                    ]}
                    error={errors.category_id}
                />
                <AdminSelectField
                    label={t('sizeGuides.brand')}
                    value={data.brand_id}
                    onChange={(value) =>
                        setData('brand_id', value === '' ? '' : Number(value))
                    }
                    options={[
                        { value: '', label: t('sizeGuides.noneBrand') },
                        ...brands.map((brand) => ({
                            value: brand.id,
                            label: brand.name,
                        })),
                    ]}
                    error={errors.brand_id}
                />

                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="isDefault"
                            checked={data.is_default}
                            onCheckedChange={(checked) =>
                                setData('is_default', checked === true)
                            }
                        />
                        <Label htmlFor="isDefault" className="admin-label">
                            {t('sizeGuides.isDefault')}
                        </Label>
                    </div>
                    <p className="admin-caption">
                        {t('sizeGuides.isDefaultHint')}
                    </p>
                    {errors.is_default && (
                        <p className="admin-caption text-red-600">
                            {errors.is_default}
                        </p>
                    )}
                </div>

                <AdminButton type="submit" disabled={processing}>
                    {submitLabel}
                </AdminButton>
            </AdminFormSection>
        </form>
    );
}
