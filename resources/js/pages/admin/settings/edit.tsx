import { Head, setLayoutProps, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
    AdminTextareaField,
} from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { Checkbox } from '@/components/ui/checkbox';
import { LogoUploadField } from '@/pages/admin/settings/components/logo-upload-field';
import type { StoreProfile } from '@/types/store-profile';

type AdminSettingsEditProps = {
    profile: StoreProfile;
    returnPolicy: {
        returnsEnabled: boolean;
        returnsWindowDays: number;
    };
};

type StoreProfileForm = Omit<StoreProfile, 'logoUrl' | 'logoWideUrl'> & {
    logoUrl: string;
    logo: File | null;
    logoWideUrl: string;
    logoWide: File | null;
    returnsEnabled: boolean;
    returnsWindowDays: number;
};

export default function AdminSettingsEdit({
    profile,
    returnPolicy,
}: AdminSettingsEditProps) {
    const { t } = useTranslation('admin');
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const [logoWidePreviewUrl, setLogoWidePreviewUrl] = useState<string | null>(
        null,
    );

    const { data, setData, processing, errors, transform, post } =
        useForm<StoreProfileForm>({
            ...profile,
            logoUrl: profile.logoUrl ?? '',
            logo: null,
            logoWideUrl: profile.logoWideUrl ?? '',
            logoWide: null,
            currency: profile.currency || 'USD',
            returnsEnabled: returnPolicy.returnsEnabled,
            returnsWindowDays: returnPolicy.returnsWindowDays,
        });

    setLayoutProps({
        breadcrumbs: [
            { title: t('breadcrumb.admin'), href: '/admin' },
            { title: t('nav.settings'), href: '/admin/settings' },
        ],
    });

    useEffect(() => {
        return () => {
            if (logoPreviewUrl) {
                URL.revokeObjectURL(logoPreviewUrl);
            }
        };
    }, [logoPreviewUrl]);

    useEffect(() => {
        return () => {
            if (logoWidePreviewUrl) {
                URL.revokeObjectURL(logoWidePreviewUrl);
            }
        };
    }, [logoWidePreviewUrl]);

    const setLogoFile = (file: File | null) => {
        if (logoPreviewUrl) {
            URL.revokeObjectURL(logoPreviewUrl);
        }

        setLogoPreviewUrl(file ? URL.createObjectURL(file) : null);
        setData('logo', file);

        if (!file) {
            setData('logoUrl', '');
        }
    };

    const setLogoWideFile = (file: File | null) => {
        if (logoWidePreviewUrl) {
            URL.revokeObjectURL(logoWidePreviewUrl);
        }

        setLogoWidePreviewUrl(file ? URL.createObjectURL(file) : null);
        setData('logoWide', file);

        if (!file) {
            setData('logoWideUrl', '');
        }
    };

    const logoPreview = logoPreviewUrl ?? (data.logoUrl || null);
    const logoWidePreview = logoWidePreviewUrl ?? (data.logoWideUrl || null);

    const submit = () => {
        transform((current) => ({ ...current, _method: 'put' }));
        post('/admin/settings', { forceFormData: true });
    };

    return (
        <>
            <Head title={t('nav.settings')} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <AdminPageHeader
                    title={t('settings.title')}
                    subtitle={t('settings.description')}
                    sticky
                    actions={
                        <AdminButton onClick={submit} disabled={processing}>
                            {t('settings.save')}
                        </AdminButton>
                    }
                />

                <div className="grid items-start gap-6 desktop:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
                    <div className="space-y-6">
                        <AdminFormSection
                            title={t('settings.profileSection')}
                            description={t(
                                'settings.profileSectionDescription',
                            )}
                        >
                            <AdminInputField
                                label={t('settings.name')}
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                error={errors.name}
                            />
                            <AdminTextareaField
                                label={t('settings.shortDescription')}
                                value={data.shortDescription}
                                onChange={(e) =>
                                    setData('shortDescription', e.target.value)
                                }
                                error={errors.shortDescription}
                                rows={3}
                            />
                        </AdminFormSection>

                        <AdminFormSection
                            title={t('settings.contactSection')}
                            description={t(
                                'settings.contactSectionDescription',
                            )}
                        >
                            <div className="grid gap-4 tablet:grid-cols-2">
                                <AdminInputField
                                    label={t('settings.contactEmail')}
                                    type="email"
                                    value={data.contactEmail}
                                    onChange={(e) =>
                                        setData('contactEmail', e.target.value)
                                    }
                                    error={errors.contactEmail}
                                />
                                <AdminInputField
                                    label={t('settings.contactPhone')}
                                    value={data.contactPhone}
                                    onChange={(e) =>
                                        setData('contactPhone', e.target.value)
                                    }
                                    error={errors.contactPhone}
                                />
                            </div>
                            <AdminTextareaField
                                label={t('settings.address')}
                                value={data.address}
                                onChange={(e) =>
                                    setData('address', e.target.value)
                                }
                                error={errors.address}
                                rows={2}
                            />
                        </AdminFormSection>

                        <AdminFormSection
                            title={t('settings.socialSection')}
                            description={t('settings.socialSectionDescription')}
                        >
                            <div className="grid gap-4 tablet:grid-cols-2">
                                <AdminInputField
                                    label={t('settings.facebook')}
                                    value={data.facebookUrl ?? ''}
                                    onChange={(e) =>
                                        setData('facebookUrl', e.target.value)
                                    }
                                    error={errors.facebookUrl}
                                    placeholder="https://facebook.com/…"
                                />
                                <AdminInputField
                                    label={t('settings.instagram')}
                                    value={data.instagramUrl ?? ''}
                                    onChange={(e) =>
                                        setData('instagramUrl', e.target.value)
                                    }
                                    error={errors.instagramUrl}
                                    placeholder="https://instagram.com/…"
                                />
                                <AdminInputField
                                    label={t('settings.tiktok')}
                                    value={data.tiktokUrl ?? ''}
                                    onChange={(e) =>
                                        setData('tiktokUrl', e.target.value)
                                    }
                                    error={errors.tiktokUrl}
                                    placeholder="https://tiktok.com/@…"
                                />
                                <AdminInputField
                                    label={t('settings.youtube')}
                                    value={data.youtubeUrl ?? ''}
                                    onChange={(e) =>
                                        setData('youtubeUrl', e.target.value)
                                    }
                                    error={errors.youtubeUrl}
                                    placeholder="https://youtube.com/@…"
                                />
                            </div>
                        </AdminFormSection>

                        <AdminFormSection
                            title={t('settings.returnsSection')}
                            description={t(
                                'settings.returnsSectionDescription',
                            )}
                        >
                            <label className="flex items-center gap-3">
                                <Checkbox
                                    checked={data.returnsEnabled}
                                    onCheckedChange={(checked) =>
                                        setData(
                                            'returnsEnabled',
                                            checked === true,
                                        )
                                    }
                                />
                                <span>{t('settings.returnsEnabled')}</span>
                            </label>
                            <AdminInputField
                                className="mt-4"
                                label={t('settings.returnsWindowDays')}
                                type="number"
                                min={1}
                                max={365}
                                value={String(data.returnsWindowDays)}
                                onChange={(e) =>
                                    setData(
                                        'returnsWindowDays',
                                        Number(e.target.value),
                                    )
                                }
                                error={errors.returnsWindowDays}
                            />
                        </AdminFormSection>
                    </div>

                    <aside className="space-y-6 desktop:sticky desktop:top-24">
                        <AdminFormSection
                            title={t('settings.brandingSection')}
                            description={t(
                                'settings.brandingSectionDescription',
                            )}
                        >
                            <div className="space-y-6">
                                <LogoUploadField
                                    label={t('settings.logo')}
                                    hint={t('settings.logoHint')}
                                    previewUrl={logoPreview}
                                    variant="square"
                                    error={errors.logo}
                                    onChange={setLogoFile}
                                />
                                <LogoUploadField
                                    label={t('settings.logoWide')}
                                    hint={t('settings.logoWideHint')}
                                    previewUrl={logoWidePreview}
                                    variant="wide"
                                    error={errors.logoWide}
                                    onChange={setLogoWideFile}
                                />
                            </div>
                        </AdminFormSection>

                        <AdminFormSection
                            title={t('settings.regionalSection')}
                            description={t(
                                'settings.regionalSectionDescription',
                            )}
                        >
                            <AdminSelectField
                                label={t('settings.currency')}
                                value={data.currency}
                                onChange={(value) => setData('currency', value)}
                                options={[
                                    {
                                        value: 'USD',
                                        label: 'USD — US Dollar',
                                    },
                                    {
                                        value: 'VND',
                                        label: 'VND — Vietnamese Đồng',
                                    },
                                ]}
                            />

                            <div className="rounded-admin-md border-admin border bg-[var(--admin-neutral)] px-3 py-2.5">
                                <p className="admin-caption text-admin-secondary">
                                    {t('settings.envManagedNotice')}
                                </p>
                            </div>
                        </AdminFormSection>
                    </aside>
                </div>
            </div>
        </>
    );
}
