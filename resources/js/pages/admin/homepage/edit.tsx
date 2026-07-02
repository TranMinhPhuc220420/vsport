import { Head, Link, useForm, setLayoutProps } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminInputField } from '@/components/admin/admin-field';
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

type CampaignForm = Campaign & {
    image: File | null;
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

type CampaignFieldsProps = {
    index: number;
    campaign: CampaignForm;
    canRemove: boolean;
    errors: Record<string, string | undefined>;
    onChange: (field: keyof CampaignForm, value: string | File | null) => void;
    onRemove: () => void;
};

function CampaignFields({
    index,
    campaign,
    canRemove,
    errors,
    onChange,
    onRemove,
}: CampaignFieldsProps) {
    const { t } = useTranslation('admin');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(
        null,
    );

    useEffect(() => {
        return () => {
            if (uploadPreviewUrl) {
                URL.revokeObjectURL(uploadPreviewUrl);
            }
        };
    }, [uploadPreviewUrl]);

    const setUploadedImage = (file: File | null) => {
        if (uploadPreviewUrl) {
            URL.revokeObjectURL(uploadPreviewUrl);
        }

        setUploadPreviewUrl(file ? URL.createObjectURL(file) : null);
        onChange('image', file);
    };

    const heroPreview = uploadPreviewUrl ?? campaign.imageUrl;
    const errorFor = (field: string) => errors[`campaigns.${index}.${field}`];

    return (
        <AdminCard>
            <div className="flex items-center justify-between">
                <h2 className="admin-section-title">
                    {t('homepage.campaignNumber', { number: index + 1 })}
                </h2>
                {canRemove && (
                    <AdminButton
                        type="button"
                        variant="ghost"
                        onClick={onRemove}
                    >
                        {t('homepage.removeCampaign')}
                    </AdminButton>
                )}
            </div>
            <div className="mt-4 space-y-4">
                <AdminInputField
                    label={t('homepage.headline')}
                    value={campaign.headline}
                    onChange={(e) => onChange('headline', e.target.value)}
                    error={errorFor('headline')}
                />
                <AdminInputField
                    label={t('homepage.subtitle')}
                    value={campaign.subtitle}
                    onChange={(e) => onChange('subtitle', e.target.value)}
                    error={errorFor('subtitle')}
                />

                <div className="space-y-2">
                    <label className="admin-label">
                        {t('homepage.heroImage')}
                    </label>
                    {heroPreview ? (
                        <img
                            src={heroPreview}
                            alt=""
                            className="rounded-admin-lg border-admin aspect-[12/5] w-full border object-cover"
                        />
                    ) : null}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            setUploadedImage(e.target.files?.[0] ?? null);
                            e.target.value = '';
                        }}
                    />
                    <div className="flex flex-wrap gap-2">
                        <AdminButton
                            type="button"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {t('homepage.uploadImage')}
                        </AdminButton>
                        {campaign.image && (
                            <AdminButton
                                type="button"
                                variant="ghost"
                                onClick={() => setUploadedImage(null)}
                            >
                                {t('homepage.clearUpload')}
                            </AdminButton>
                        )}
                    </div>
                    {errorFor('image') && (
                        <p className="text-sm text-red-600">
                            {errorFor('image')}
                        </p>
                    )}
                </div>

                <AdminInputField
                    label={t('homepage.imageUrl')}
                    value={campaign.imageUrl}
                    onChange={(e) => onChange('imageUrl', e.target.value)}
                    error={errorFor('imageUrl')}
                    hint={t('homepage.imageUrlHint')}
                />
                <AdminInputField
                    label={t('homepage.ctaLabel')}
                    value={campaign.ctaLabel}
                    onChange={(e) => onChange('ctaLabel', e.target.value)}
                    error={errorFor('ctaLabel')}
                />
                <AdminInputField
                    label={t('homepage.ctaHref')}
                    value={campaign.ctaHref}
                    onChange={(e) => onChange('ctaHref', e.target.value)}
                    error={errorFor('ctaHref')}
                />
            </div>
        </AdminCard>
    );
}

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

    const updateCampaign = (
        index: number,
        field: keyof CampaignForm,
        value: string | File | null,
    ) => {
        setData(
            'campaigns',
            data.campaigns.map((campaign, i) =>
                i === index ? { ...campaign, [field]: value } : campaign,
            ),
        );
    };

    const addCampaign = () => {
        setData('campaigns', [...data.campaigns, { ...emptyCampaign }]);
    };

    const removeCampaign = (index: number) => {
        setData(
            'campaigns',
            data.campaigns.filter((_, i) => i !== index),
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        // PHP does not parse multipart form data on PUT requests, so we must
        // POST with method spoofing for the file uploads to reach the server.
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

                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    {data.campaigns.map((campaign, index) => (
                        <CampaignFields
                            key={index}
                            index={index}
                            campaign={campaign}
                            canRemove={data.campaigns.length > 1}
                            errors={
                                errors as Record<string, string | undefined>
                            }
                            onChange={(field, value) =>
                                updateCampaign(index, field, value)
                            }
                            onRemove={() => removeCampaign(index)}
                        />
                    ))}

                    <div className="flex flex-wrap items-center gap-2">
                        <AdminButton
                            type="button"
                            variant="secondary"
                            onClick={addCampaign}
                        >
                            {t('homepage.addCampaign')}
                        </AdminButton>
                        <AdminButton type="submit" disabled={processing}>
                            {t('homepage.save')}
                        </AdminButton>
                    </div>
                </form>

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
