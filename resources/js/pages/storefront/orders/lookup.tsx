import { Form, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import OrderLookupController from '@/actions/App/Http/Controllers/Storefront/OrderLookupController';
import { AuthField, AuthInput, StorefrontButton } from '@/components/storefront';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';

type OrderLookupPageProps = {
    seo: SeoData;
};

export default function OrderLookupPage({ seo }: OrderLookupPageProps) {
    const { t } = useTranslation('storefront');

    return (
        <>
            <PageSeo seo={seo} />

            <div className="storefront-container storefront-section max-w-md">
                <h1 className="text-heading-xl text-ink">
                    {t('orders.lookup.title')}
                </h1>
                <p className="text-caption-md mt-2 text-mute">
                    {t('orders.lookup.description')}
                </p>

                <Form
                    {...OrderLookupController.store.form()}
                    options={{ preserveScroll: true }}
                    resetOnError
                    className="mt-8 space-y-5"
                >
                    {({ errors, processing }) => (
                        <>
                            <AuthField
                                id="orderNumber"
                                label={t('orders.lookup.orderNumber')}
                                error={errors.orderNumber}
                            >
                                <AuthInput
                                    id="orderNumber"
                                    name="orderNumber"
                                    required
                                    placeholder={t(
                                        'orders.lookup.orderNumberPlaceholder',
                                    )}
                                    error={errors.orderNumber}
                                />
                            </AuthField>

                            <AuthField
                                id="email"
                                label={t('orders.lookup.email')}
                                error={errors.email}
                            >
                                <AuthInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder={t(
                                        'orders.lookup.emailPlaceholder',
                                    )}
                                    error={errors.email}
                                />
                            </AuthField>

                            <StorefrontButton
                                type="submit"
                                variant="primary"
                                disabled={processing}
                                className="w-full"
                            >
                                {t('orders.lookup.submit')}
                            </StorefrontButton>
                        </>
                    )}
                </Form>

                <p className="text-caption-md mt-6 text-mute">
                    <Link href="/orders" className="underline underline-offset-4">
                        {t('orders.lookup.backToOrders')}
                    </Link>
                </p>
            </div>
        </>
    );
}
