import { Head, Link, useForm, setLayoutProps } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import {
    HomepageCampaignManager,
    type CampaignForm,
} from '@/components/admin/homepage-campaign-manager';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { AdminCard } from '@/components/admin/ui/admin-card';

type Campaign = {
    headline: string;
    subtitle: string;
    imageUrl: string;
    ctaLabel: string;
    ctaHref: string;
};

type FeaturedProduct = {
    id: number;
    name: string;
    slug: string;
    styleCode: string;
};

type AdminHomepageEditProps = {
    campaigns: Campaign[];
    featuredProducts: { data: FeaturedProduct[] };
};

const emptyCampaign: CampaignForm = {
    headline: '',
    subtitle: '',
    imageUrl: '',
    ctaLabel: '',
    ctaHref: '',
    image: null,
};

export default function AdminHomepageEdit({
    campaigns,
    featuredProducts,
}: AdminHomepageEditProps) {
    const { t } = useTranslation('admin');
    const { data, setData, processing, errors, transform, post } = useForm<{
        campaigns: CampaignForm[];
    }>({
        campaigns:
            campaigns.length > 0
                ? campaigns.map((campaign) => ({ ...campaign, image: null }))
                : [{ ...emptyCampaign }],
    });

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('homepage.title'), href: '/admin/homepage' },
        ],
    });

    const submit = () => {
        transform((current) => ({ ...current, _method: 'put' }));
        post('/admin/homepage', { forceFormData: true });
    };

    return (
        <>
            <Head title={t('homepage.title')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('homepage.title')}
                    subtitle={t('homepage.description')}
                />

                <HomepageCampaignManager
                    campaigns={data.campaigns}
                    errors={errors as Record<string, string | undefined>}
                    processing={processing}
                    onChange={(next) => setData('campaigns', next)}
                    onSubmit={submit}
                />

                <AdminCard>
                    <h2 className="admin-section-title">
                        {t('homepage.featuredProducts')}
                    </h2>
                    <p className="text-admin-secondary mt-2 text-sm">
                        {t('homepage.featuredHint')}
                    </p>
                    {featuredProducts.data.length === 0 ? (
                        <p className="text-admin-secondary mt-4 text-sm">
                            {t('homepage.noFeatured')}
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-2">
                            {featuredProducts.data.map((product) => (
                                <li key={product.id}>
                                    <Link
                                        href={`/admin/products/${product.slug}/edit`}
                                        className="admin-body-strong hover:underline"
                                    >
                                        {product.name}
                                    </Link>
                                    <span className="text-admin-secondary ml-2 text-xs">
                                        {product.styleCode}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-4">
                        <AdminButton asChild variant="secondary">
                            <Link href="/admin/products">
                                {t('homepage.manageProducts')}
                            </Link>
                        </AdminButton>
                    </div>
                </AdminCard>
            </div>
        </>
    );
}
