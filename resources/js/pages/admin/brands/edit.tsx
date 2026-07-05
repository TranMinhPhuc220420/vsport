import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { BrandForm } from '@/components/admin/brand-form';

type AdminBrandsEditProps = {
    brand: {
        id: number;
        name: string;
        slug: string;
    };
};

export default function AdminBrandsEdit({ brand }: AdminBrandsEditProps) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('breadcrumb.brands'), href: '/admin/brands' },
            {
                title: t('breadcrumb.edit'),
                href: `/admin/brands/${brand.id}/edit`,
            },
        ],
    });

    return (
        <BrandForm
            mode="edit"
            action={`/admin/brands/${brand.id}`}
            method="put"
            initial={{
                name: brand.name,
                slug: brand.slug,
            }}
        />
    );
}
