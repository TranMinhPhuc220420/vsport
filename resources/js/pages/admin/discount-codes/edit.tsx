import { setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { DiscountCodeForm } from '@/components/admin/discount-code-form';

type AdminDiscountCodesEditProps = {
    discountCode: {
        id: number;
        code: string;
        type: 'percent' | 'fixed';
        value: number;
        minOrderAmount: number;
        maxUses: number | null;
        startsAt: string | null;
        expiresAt: string | null;
        isActive: boolean;
    };
};

export default function AdminDiscountCodesEdit({
    discountCode,
}: AdminDiscountCodesEditProps) {
    const { t } = useTranslation('admin');

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            {
                title: t('breadcrumb.discountCodes'),
                href: '/admin/discount-codes',
            },
            { title: t('breadcrumb.edit'), href: '#' },
        ],
    });

    return (
        <DiscountCodeForm
            mode="edit"
            action={`/admin/discount-codes/${discountCode.id}`}
            method="put"
            initial={{
                code: discountCode.code,
                type: discountCode.type,
                value: discountCode.value,
                minOrderAmount: discountCode.minOrderAmount,
                maxUses: discountCode.maxUses ?? '',
                startsAt: discountCode.startsAt ?? '',
                expiresAt: discountCode.expiresAt ?? '',
                isActive: discountCode.isActive,
            }}
        />
    );
}
