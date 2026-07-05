import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { BrandForm } from '@/components/admin/brand-form';

export default function AdminBrandsCreate() {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.brands'), href: '/admin/brands' },
            { title: t('breadcrumb.create'), href: '/admin/brands/create' },
        ],
    });

    return (
        <BrandForm
            mode="create"
            action="/admin/brands"
            method="post"
            initial={{
                name: '',
                slug: '',
            }}
        />
    );
}
