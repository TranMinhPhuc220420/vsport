import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { SizeGuideForm } from '@/components/admin/size-guide-form';

type AdminSizeGuidesCreateProps = {
    categories: { id: number; name: string }[];
    brands: { id: number; name: string }[];
};

export default function AdminSizeGuidesCreate({
    categories,
    brands,
}: AdminSizeGuidesCreateProps) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.sizeGuides'), href: '/admin/size-guides' },
            { title: t('breadcrumb.create'), href: '/admin/size-guides/create' },
        ],
    });

    return (
        <SizeGuideForm
            mode="create"
            action="/admin/size-guides"
            method="post"
            categories={categories}
            brands={brands}
            initial={{
                name: '',
                category_id: '',
                brand_id: '',
                is_default: false,
            }}
        />
    );
}
