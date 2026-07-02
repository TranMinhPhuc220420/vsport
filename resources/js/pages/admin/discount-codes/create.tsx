import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { DiscountCodeForm } from '@/components/admin/discount-code-form';

export default function AdminDiscountCodesCreate() {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.discountCodes'),
                href: '/admin/discount-codes',
            },
            {
                title: t('breadcrumb.create'),
                href: '/admin/discount-codes/create',
            },
        ],
    });

    return (
        <DiscountCodeForm
            mode="create"
            action="/admin/discount-codes"
            method="post"
            initial={{
                code: '',
                type: 'percent',
                value: '',
                minOrderAmount: '',
                maxUses: '',
                startsAt: '',
                expiresAt: '',
                isActive: true,
            }}
        />
    );
}
