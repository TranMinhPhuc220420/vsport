import { ChevronDown, ChevronUp, ImageIcon, Plus } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    AdminInputField,
    AdminSelectField,
} from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { cn } from '@/lib/utils';

export type CampaignForm = {
    headline: string;
    subtitle: string;
    imageUrl: string;
    ctaLabel: string;
    ctaHref: string;
    image: File | null;
};

type HomepageCampaignManagerProps = {
    campaigns: CampaignForm[];
    errors: Record<string, string | undefined>;
    processing: boolean;
    onChange: (campaigns: CampaignForm[]) => void;
    onSubmit: () => void;
};

const CTA_LINK_PRESETS = [
    { value: '/men', labelKey: 'homepage.ctaLinkMen' },
    { value: '/women', labelKey: 'homepage.ctaLinkWomen' },
    { value: '/men?sort=newest', labelKey: 'homepage.ctaLinkNewArrivals' },
    {
        value: '/women?sort=newest',
        labelKey: 'homepage.ctaLinkNewArrivalsWomen',
    },
] as const;

function campaignPlacementKey(index: number): string {
    if (index === 0) {
        return 'homepage.placementHeroPrimary';
    }

    if (index === 1) {
        return 'homepage.placementHeroAndEditorial';
    }

    return 'homepage.placementHeroSlide';
}

function CampaignPreview({ campaign }: { campaign: CampaignForm }) {
    const { t } = useTranslation('admin');
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        campaign.imageUrl || null,
    );

    useEffect(() => {
        if (campaign.image instanceof File) {
            const url = URL.createObjectURL(campaign.image);
            setPreviewUrl(url);

            return () => URL.revokeObjectURL(url);
        }

        setPreviewUrl(campaign.imageUrl || null);
    }, [campaign.image, campaign.imageUrl]);

    return (
        <div className="rounded-admin-lg border-admin overflow-hidden border">
            <div className="border-admin border-b bg-[var(--admin-neutral)] px-3 py-2">
                <p className="admin-caption">{t('homepage.preview')}</p>
            </div>
            <div className="relative aspect-[16/7] w-full overflow-hidden bg-[var(--admin-neutral)]">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt=""
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="text-admin-secondary flex size-full flex-col items-center justify-center gap-2">
                        <ImageIcon className="size-8 opacity-40" />
                        <p className="text-xs">
                            {t('homepage.noImagePreview')}
                        </p>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--admin-primary)]/80 via-[var(--admin-primary)]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-xs text-white/80">
                        {campaign.subtitle || t('homepage.previewSubtitle')}
                    </p>
                    <p className="mt-1 text-lg font-medium text-white">
                        {campaign.headline || t('homepage.previewHeadline')}
                    </p>
                    {campaign.ctaLabel && (
                        <span className="mt-3 inline-block rounded-full border border-white/60 px-4 py-1.5 text-xs text-white">
                            {campaign.ctaLabel}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

type CampaignEditorProps = {
    index: number;
    campaign: CampaignForm;
    errors: Record<string, string | undefined>;
    onChange: (field: keyof CampaignForm, value: string | File | null) => void;
};

function CampaignEditor({
    index,
    campaign,
    errors,
    onChange,
}: CampaignEditorProps) {
    const { t } = useTranslation('admin');
    const heroImageLabelId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showUrlInput, setShowUrlInput] = useState(
        () => Boolean(campaign.imageUrl) && !campaign.image,
    );
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

        if (file) {
            setShowUrlInput(false);
        }
    };

    const heroPreview = uploadPreviewUrl ?? campaign.imageUrl;
    const errorFor = (field: string) => errors[`campaigns.${index}.${field}`];

    const presetValue =
        CTA_LINK_PRESETS.find((preset) => preset.value === campaign.ctaHref)
            ?.value ?? '';

    return (
        <div className="space-y-4">
            <div className="grid gap-4 tablet:grid-cols-2">
                <AdminInputField
                    label={t('homepage.headline')}
                    value={campaign.headline}
                    onChange={(e) => onChange('headline', e.target.value)}
                    error={errorFor('headline')}
                    placeholder={t('homepage.headlinePlaceholder')}
                />
                <AdminInputField
                    label={t('homepage.subtitle')}
                    value={campaign.subtitle}
                    onChange={(e) => onChange('subtitle', e.target.value)}
                    error={errorFor('subtitle')}
                    placeholder={t('homepage.subtitlePlaceholder')}
                />
            </div>

            <div
                className="space-y-2"
                role="group"
                aria-labelledby={heroImageLabelId}
            >
                <label id={heroImageLabelId} className="admin-label">
                    {t('homepage.heroImage')}
                </label>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        'border-admin group rounded-admin-md relative w-full overflow-hidden border bg-[var(--admin-neutral)] transition hover:border-[var(--admin-primary)]/40',
                        heroPreview ? 'aspect-[16/7]' : 'py-10',
                    )}
                >
                    {heroPreview ? (
                        <>
                            <img
                                src={heroPreview}
                                alt=""
                                className="size-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-[var(--admin-primary)]/0 transition group-hover:bg-[var(--admin-primary)]/40">
                                <span className="rounded-admin-md bg-[var(--admin-surface)] px-3 py-1.5 text-sm font-medium opacity-0 shadow-sm transition group-hover:opacity-100">
                                    {t('homepage.changeImage')}
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="text-admin-secondary flex flex-col items-center gap-2">
                            <ImageIcon className="size-8 opacity-50" />
                            <span className="text-sm">
                                {t('homepage.uploadImageHint')}
                            </span>
                        </div>
                    )}
                </button>
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
                <div className="flex flex-wrap items-center gap-2">
                    <AdminButton
                        type="button"
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageIcon className="size-4" />
                        {heroPreview
                            ? t('homepage.changeImage')
                            : t('homepage.uploadImage')}
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
                    <AdminButton
                        type="button"
                        variant="ghost"
                        onClick={() => setShowUrlInput((current) => !current)}
                    >
                        {showUrlInput
                            ? t('homepage.hideImageUrl')
                            : t('homepage.useImageUrl')}
                    </AdminButton>
                </div>
                {showUrlInput && (
                    <AdminInputField
                        label={t('homepage.imageUrl')}
                        value={campaign.imageUrl}
                        onChange={(e) => onChange('imageUrl', e.target.value)}
                        error={errorFor('imageUrl')}
                        hint={t('homepage.imageUrlHint')}
                        placeholder="https://"
                    />
                )}
                {errorFor('image') && (
                    <p className="text-sm text-red-600">{errorFor('image')}</p>
                )}
            </div>

            <div className="grid gap-4 tablet:grid-cols-2">
                <AdminInputField
                    label={t('homepage.ctaLabel')}
                    value={campaign.ctaLabel}
                    onChange={(e) => onChange('ctaLabel', e.target.value)}
                    error={errorFor('ctaLabel')}
                    placeholder={t('homepage.ctaLabelPlaceholder')}
                />
                <div className="space-y-4">
                    <AdminSelectField
                        label={t('homepage.ctaLinkPreset')}
                        value={presetValue}
                        onChange={(value) => {
                            if (value) {
                                onChange('ctaHref', value);
                            }
                        }}
                        options={[
                            { value: '', label: t('homepage.ctaLinkCustom') },
                            ...CTA_LINK_PRESETS.map((preset) => ({
                                value: preset.value,
                                label: t(preset.labelKey),
                            })),
                        ]}
                    />
                    <AdminInputField
                        label={t('homepage.ctaHref')}
                        value={campaign.ctaHref}
                        onChange={(e) => onChange('ctaHref', e.target.value)}
                        error={errorFor('ctaHref')}
                        placeholder="/men"
                    />
                </div>
            </div>
        </div>
    );
}

type CampaignListItemProps = {
    index: number;
    campaign: CampaignForm;
    total: number;
    expanded: boolean;
    errors: Record<string, string | undefined>;
    onToggle: () => void;
    onChange: (field: keyof CampaignForm, value: string | File | null) => void;
    onMove: (direction: 'up' | 'down') => void;
    onRemove: () => void;
    canRemove: boolean;
};

function CampaignListItem({
    index,
    campaign,
    total,
    expanded,
    errors,
    onToggle,
    onChange,
    onMove,
    onRemove,
    canRemove,
}: CampaignListItemProps) {
    const { t } = useTranslation('admin');
    const [uploadThumbnail, setUploadThumbnail] = useState<string | null>(null);

    useEffect(() => {
        if (campaign.image instanceof File) {
            const url = URL.createObjectURL(campaign.image);
            setUploadThumbnail(url);

            return () => URL.revokeObjectURL(url);
        }

        setUploadThumbnail(null);
    }, [campaign.image]);

    const thumbnail = uploadThumbnail ?? campaign.imageUrl;
    const hasErrors = Object.keys(errors).some((key) =>
        key.startsWith(`campaigns.${index}.`),
    );

    return (
        <div
            className={cn(
                'rounded-admin-md border-admin overflow-hidden border',
                expanded && 'ring-2 ring-[var(--admin-primary)]/20',
                hasErrors && !expanded && 'border-red-300',
            )}
        >
            <div className="flex flex-col gap-3 bg-[var(--admin-surface)] p-3">
                <button
                    type="button"
                    onClick={onToggle}
                    className="flex w-full min-w-0 items-start gap-3 text-left"
                >
                    <div className="border-admin rounded-admin-sm size-14 shrink-0 overflow-hidden border bg-[var(--admin-neutral)]">
                        {thumbnail ? (
                            <img
                                src={thumbnail}
                                alt=""
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="text-admin-secondary flex size-full items-center justify-center">
                                <ImageIcon className="size-5 opacity-40" />
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="admin-body-strong truncate">
                                {campaign.headline ||
                                    t('homepage.untitledCampaign')}
                            </span>
                            <span className="rounded-admin-sm bg-[var(--admin-neutral)] px-2 py-0.5 text-xs text-[var(--admin-secondary)]">
                                {t(campaignPlacementKey(index), {
                                    number: index + 1,
                                })}
                            </span>
                        </div>
                        {campaign.subtitle && (
                            <p className="text-admin-secondary mt-0.5 truncate text-sm">
                                {campaign.subtitle}
                            </p>
                        )}
                    </div>
                    <span className="text-admin-secondary shrink-0 text-sm">
                        {expanded ? t('homepage.collapse') : t('homepage.edit')}
                    </span>
                    <ChevronDown
                        className={cn(
                            'text-admin-secondary mt-0.5 size-5 shrink-0 transition',
                            expanded && 'rotate-180',
                        )}
                    />
                </button>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <AdminButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={index === 0}
                        onClick={() => onMove('up')}
                    >
                        <ChevronUp className="size-4" />
                        {t('homepage.moveUp')}
                    </AdminButton>
                    <AdminButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={index === total - 1}
                        onClick={() => onMove('down')}
                    >
                        <ChevronDown className="size-4" />
                        {t('homepage.moveDown')}
                    </AdminButton>
                </div>
            </div>

            {expanded && (
                <div className="border-admin space-y-4 border-t p-4">
                    <CampaignEditor
                        index={index}
                        campaign={campaign}
                        errors={errors}
                        onChange={onChange}
                    />
                    {canRemove && (
                        <div className="flex justify-end border-t border-[var(--admin-border)] pt-4">
                            <AdminButton
                                type="button"
                                variant="ghost"
                                onClick={onRemove}
                            >
                                {t('homepage.removeCampaign')}
                            </AdminButton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function HomepageCampaignManager({
    campaigns,
    errors,
    processing,
    onChange,
    onSubmit,
}: HomepageCampaignManagerProps) {
    const { t } = useTranslation('admin');
    const [expandedIndex, setExpandedIndex] = useState(0);

    const updateCampaign = (
        index: number,
        field: keyof CampaignForm,
        value: string | File | null,
    ) => {
        onChange(
            campaigns.map((campaign, i) =>
                i === index ? { ...campaign, [field]: value } : campaign,
            ),
        );
    };

    const addCampaign = () => {
        onChange([
            ...campaigns,
            {
                headline: '',
                subtitle: '',
                imageUrl: '',
                ctaLabel: '',
                ctaHref: '',
                image: null,
            },
        ]);
        setExpandedIndex(campaigns.length);
    };

    const removeCampaign = (index: number) => {
        onChange(campaigns.filter((_, i) => i !== index));
        setExpandedIndex((current) =>
            current >= index && current > 0 ? current - 1 : current,
        );
    };

    const moveCampaign = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= campaigns.length) {
            return;
        }

        const reordered = [...campaigns];
        const [moved] = reordered.splice(index, 1);
        reordered.splice(targetIndex, 0, moved);
        onChange(reordered);

        if (expandedIndex === index) {
            setExpandedIndex(targetIndex);
        } else if (expandedIndex === targetIndex) {
            setExpandedIndex(index);
        }
    };

    const activeCampaign = campaigns[expandedIndex] ?? campaigns[0];

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
            className="space-y-6"
        >
            <div className="grid gap-6 xl:grid-cols-2">
                <AdminFormSection
                    title={t('homepage.campaignsSection')}
                    description={t('homepage.campaignsHint')}
                    actions={
                        <AdminButton
                            type="button"
                            variant="secondary"
                            onClick={addCampaign}
                            disabled={campaigns.length >= 10}
                        >
                            <Plus className="size-4" />
                            {t('homepage.addCampaign')}
                        </AdminButton>
                    }
                >
                    <div className="space-y-3">
                        {campaigns.map((campaign, index) => (
                            <CampaignListItem
                                key={index}
                                index={index}
                                campaign={campaign}
                                total={campaigns.length}
                                expanded={expandedIndex === index}
                                errors={errors}
                                onToggle={() =>
                                    setExpandedIndex(
                                        expandedIndex === index ? -1 : index,
                                    )
                                }
                                onChange={(field, value) =>
                                    updateCampaign(index, field, value)
                                }
                                onMove={(direction) =>
                                    moveCampaign(index, direction)
                                }
                                onRemove={() => removeCampaign(index)}
                                canRemove={campaigns.length > 1}
                            />
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <AdminButton type="submit" disabled={processing}>
                            {t('homepage.save')}
                        </AdminButton>
                        <p className="text-admin-secondary text-sm">
                            {t('homepage.saveHint')}
                        </p>
                    </div>
                </AdminFormSection>

                {activeCampaign && (
                    <div className="xl:sticky xl:top-6 xl:self-start">
                        <CampaignPreview campaign={activeCampaign} />
                    </div>
                )}
            </div>
        </form>
    );
}
