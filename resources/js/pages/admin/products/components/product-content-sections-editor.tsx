import { useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { AdminInputField } from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { ContentSectionImageManager } from '@/components/admin/content-section-image-manager';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { initialHtml } from '@/lib/richtext';
import type { AdminProduct } from '@/types/admin-product';

type ProductContentSectionsEditorProps = {
    product: AdminProduct;
};

export function ProductContentSectionsEditor({
    product,
}: ProductContentSectionsEditorProps) {
    const { t } = useTranslation('admin');

    const form = useForm<{
        sections: Array<{
            id: number | null;
            title: string;
            content_html: string;
            sortOrder: number;
        }>;
    }>({
        sections: (product.contentSections ?? []).map((section) => ({
            id: section.id,
            title: section.title,
            content_html: initialHtml({
                html: section.contentHtml,
                text: section.content,
            }),
            sortOrder: section.sortOrder,
        })),
    });

    const addSection = () => {
        form.setData('sections', [
            ...form.data.sections,
            {
                id: null,
                title: '',
                content_html: '',
                sortOrder: form.data.sections.length,
            },
        ]);
    };

    const removeSection = (index: number) => {
        form.setData(
            'sections',
            form.data.sections.filter((_, rowIndex) => rowIndex !== index),
        );
    };

    const save = (event: React.FormEvent) => {
        event.preventDefault();
        form.put(`/admin/products/${product.slug}/content-sections`);
    };

    return (
        <form onSubmit={save}>
            <AdminFormSection
                title={t('products.tabContent')}
                description={t('products.contentSectionsHint')}
            >
                <div className="space-y-6">
                    {form.data.sections.map((section, index) => {
                        const persistedSection = product.contentSections.find(
                            (item) => item.id === section.id,
                        );

                        return (
                            <div
                                key={section.id ?? `new-section-${index}`}
                                className="border-admin rounded-admin-lg space-y-4 border p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <AdminInputField
                                        label={t(
                                            'products.contentSectionTitle',
                                        )}
                                        value={section.title}
                                        onChange={(e) => {
                                            const sections = [
                                                ...form.data.sections,
                                            ];
                                            sections[index].title =
                                                e.target.value;
                                            form.setData('sections', sections);
                                        }}
                                        error={
                                            form.errors[
                                                `sections.${index}.title` as keyof typeof form.errors
                                            ]
                                        }
                                    />
                                    <AdminButton
                                        type="button"
                                        variant="ghost"
                                        className="mt-6 shrink-0"
                                        onClick={() => removeSection(index)}
                                    >
                                        {t('products.removeContentSection')}
                                    </AdminButton>
                                </div>

                                <div className="grid gap-6 desktop:grid-cols-2">
                                    <div>
                                        <p className="admin-label mb-3">
                                            {t('products.contentSectionImages')}
                                        </p>
                                        {section.id ? (
                                            <ContentSectionImageManager
                                                key={`${section.id}-${persistedSection?.images.length ?? 0}`}
                                                sectionId={section.id}
                                                sectionTitle={section.title}
                                                productName={product.name}
                                                initialImages={
                                                    persistedSection?.images ??
                                                    []
                                                }
                                            />
                                        ) : (
                                            <p className="text-admin-secondary text-sm">
                                                {t(
                                                    'products.contentSectionImagesSaveFirst',
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    <RichTextEditor
                                        id={`product-content-section-${index}`}
                                        label={t('products.contentSectionBody')}
                                        value={section.content_html}
                                        placeholder={t(
                                            'products.contentSectionPlaceholder',
                                        )}
                                        error={
                                            form.errors[
                                                `sections.${index}.content_html` as keyof typeof form.errors
                                            ]
                                        }
                                        onChange={(html) => {
                                            const sections = [
                                                ...form.data.sections,
                                            ];
                                            sections[index].content_html =
                                                html ?? '';
                                            form.setData('sections', sections);
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={addSection}
                    >
                        {t('products.addContentSection')}
                    </AdminButton>
                    <AdminButton type="submit" disabled={form.processing}>
                        {t('products.saveContentSections')}
                    </AdminButton>
                </div>
            </AdminFormSection>
        </form>
    );
}
