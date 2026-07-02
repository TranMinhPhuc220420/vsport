import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { home } from '@/routes';

type ErrorPageProps = {
    status: 403 | 404 | 500 | 503;
};

const statusKeys: Record<number, string> = {
    403: 'error.forbidden',
    404: 'error.notFound',
    500: 'error.server',
    503: 'error.unavailable',
};

export default function ErrorPage({ status }: ErrorPageProps) {
    const { t } = useTranslation('storefront');
    const messageKey = statusKeys[status] ?? 'error.server';

    return (
        <>
            <Head title={t(messageKey)} />

            <div className="storefront-container storefront-section text-center">
                <p className="text-heading-xl font-medium text-mute">{status}</p>
                <h1 className="mt-4 text-heading-xl text-ink">{t(messageKey)}</h1>
                <p className="mx-auto mt-4 max-w-md text-body-strong text-mute">
                    {t('error.description')}
                </p>
                <StorefrontButton variant="primary" className="mt-8" asChild>
                    <Link href={home()}>{t('error.backHome')}</Link>
                </StorefrontButton>
            </div>
        </>
    );
}
