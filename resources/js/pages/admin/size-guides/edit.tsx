import { Head, setLayoutProps } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminTabs } from '@/components/admin/admin-form';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { SizeGuideFormFields } from '@/components/admin/size-guide-form-fields';
import { SizeGuideMeasureEditor } from '@/pages/admin/size-guides/components/size-guide-measure-editor';
import { SizeGuideTableEditor } from '@/pages/admin/size-guides/components/size-guide-table-editor';
import type { SizeGuide } from '@/types/catalog';

type AdminSizeGuidesEditProps = {
    sizeGuide: SizeGuide & {
        categoryId: number | null;
        brandId: number | null;
        isDefault: boolean;
    };
    categories: { id: number; name: string }[];
    brands: { id: number; name: string }[];
    activeTab?: string;
};

export default function AdminSizeGuidesEdit({
    sizeGuide,
    categories,
    brands,
    activeTab = 'details',
}: AdminSizeGuidesEditProps) {
    const { t } = useTranslation('admin');
    const [tab, setTab] = useState(activeTab);

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.sizeGuides'), href: '/admin/size-guides' },
            { title: sizeGuide.name, href: '#' },
        ],
    });

    return (
        <>
            <Head title={sizeGuide.name} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    backHref="/admin/size-guides"
                    backLabel={t('sizeGuides.back')}
                    title={sizeGuide.name}
                    sticky
                />

                <AdminTabs
                    value={tab}
                    onValueChange={setTab}
                    tabs={[
                        {
                            value: 'details',
                            label: t('sizeGuides.tabDetails'),
                            content: (
                                <div className="max-w-96">
                                    <SizeGuideFormFields
                                        action={`/admin/size-guides/${sizeGuide.id}`}
                                        method="put"
                                        categories={categories}
                                        brands={brands}
                                        initial={{
                                            name: sizeGuide.name,
                                            category_id:
                                                sizeGuide.categoryId ?? '',
                                            brand_id: sizeGuide.brandId ?? '',
                                            is_default: sizeGuide.isDefault,
                                        }}
                                        submitLabel={t('sizeGuides.save')}
                                    />
                                </div>
                            ),
                        },
                        {
                            value: 'table',
                            label: t('sizeGuides.tabTable'),
                            content: (
                                <SizeGuideTableEditor
                                    sizeGuideId={sizeGuide.id}
                                    columns={sizeGuide.columns}
                                    rows={sizeGuide.rows}
                                />
                            ),
                        },
                        {
                            value: 'measure',
                            label: t('sizeGuides.tabMeasure'),
                            content: (
                                <SizeGuideMeasureEditor
                                    sizeGuideId={sizeGuide.id}
                                    sizeGuideName={sizeGuide.name}
                                    initialContentHtml={
                                        sizeGuide.measureContentHtml
                                    }
                                    initialImageUrl={
                                        sizeGuide.measureImageUrl ?? null
                                    }
                                    initialImageAlt={
                                        sizeGuide.measureImageAlt ?? null
                                    }
                                />
                            ),
                        },
                    ]}
                />
            </div>
        </>
    );
}
