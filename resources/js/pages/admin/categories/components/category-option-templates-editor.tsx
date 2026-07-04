import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
} from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';

type OptionTemplate = {
    id?: number;
    name: string;
    position: number;
    displayType: string;
    isRequired: boolean;
    drivesGallery: boolean;
    defaultValues: string[];
};

type CategoryOptionTemplatesEditorProps = {
    categoryId: number;
    templates: OptionTemplate[];
};

const DISPLAY_TYPES = [
    { value: 'swatch', label: 'Swatch' },
    { value: 'button', label: 'Button' },
    { value: 'dropdown', label: 'Dropdown' },
];

export function CategoryOptionTemplatesEditor({
    categoryId,
    templates,
}: CategoryOptionTemplatesEditorProps) {
    const { t } = useTranslation('admin');

    const form = useForm({
        templates: templates.map((template) => ({
            id: template.id,
            name: template.name,
            position: template.position,
            displayType: template.displayType,
            isRequired: template.isRequired,
            drivesGallery: template.drivesGallery,
            defaultValues: template.defaultValues,
        })),
    });

    const addTemplate = () => {
        form.setData('templates', [
            ...form.data.templates,
            {
                name: 'Color',
                position: form.data.templates.length,
                displayType: 'swatch',
                isRequired: true,
                drivesGallery: true,
                defaultValues: [],
            },
        ]);
    };

    const save = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(`/admin/categories/${categoryId}/option-templates`);
    };

    return (
        <form onSubmit={save}>
            <AdminFormSection title={t('categories.optionTemplates')}>
                <p className="text-admin-secondary text-sm">
                    {t('categories.optionTemplatesHint')}
                </p>

                {form.data.templates.map((template, index) => (
                    <div
                        key={template.id ?? `template-${index}`}
                        className="border-admin space-y-3 rounded-admin-lg border p-4"
                    >
                        <div className="grid gap-3 tablet:grid-cols-2">
                            <AdminInputField
                                label={t('products.optionName')}
                                value={template.name}
                                onChange={(e) => {
                                    const templates = [...form.data.templates];
                                    templates[index].name = e.target.value;
                                    form.setData('templates', templates);
                                }}
                            />
                            <AdminSelectField
                                label={t('products.displayType')}
                                value={template.displayType}
                                onChange={(value) => {
                                    const templates = [...form.data.templates];
                                    templates[index].displayType = value;
                                    form.setData('templates', templates);
                                }}
                                options={DISPLAY_TYPES}
                            />
                        </div>
                        <AdminInputField
                            label={t('categories.defaultValues')}
                            value={template.defaultValues.join(', ')}
                            onChange={(e) => {
                                const templates = [...form.data.templates];
                                templates[index].defaultValues = e.target.value
                                    .split(',')
                                    .map((value) => value.trim())
                                    .filter(Boolean);
                                form.setData('templates', templates);
                            }}
                        />
                    </div>
                ))}

                <div className="flex gap-3">
                    <AdminButton type="button" variant="secondary" onClick={addTemplate}>
                        {t('categories.addTemplate')}
                    </AdminButton>
                    <AdminButton type="submit" disabled={form.processing}>
                        {t('categories.saveTemplates')}
                    </AdminButton>
                </div>
            </AdminFormSection>
        </form>
    );
}
