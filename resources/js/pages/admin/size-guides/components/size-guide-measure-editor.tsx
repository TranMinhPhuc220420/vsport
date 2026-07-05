import { useForm } from '@inertiajs/react';
import { ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminInputField } from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { AdminButton } from '@/components/admin/ui/admin-button';
import {
    deleteSizeGuideImage,
    updateSizeGuideImageAlt,
    uploadSizeGuideImage,
} from '@/lib/admin-upload';

type SizeGuideMeasureEditorProps = {
    sizeGuideId: number;
    sizeGuideName: string;
    initialContentHtml: string | null;
    initialImageUrl: string | null;
    initialImageAlt: string | null;
};

export function SizeGuideMeasureEditor({
    sizeGuideId,
    sizeGuideName,
    initialContentHtml,
    initialImageUrl,
    initialImageAlt,
}: SizeGuideMeasureEditorProps) {
    const { t } = useTranslation('admin');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
        measure_content: initialContentHtml ?? '',
    });

    const saveContent = (event: React.FormEvent) => {
        event.preventDefault();

        form.put(`/admin/size-guides/${sizeGuideId}/measure`, {
            preserveScroll: true,
            onSuccess: () => toast.success(t('sizeGuides.measureSaveSuccess')),
            onError: () => toast.error(t('sizeGuides.measureSaveFailed')),
        });
    };

    const [imageUrl, setImageUrl] = useState(initialImageUrl);
    const [imageAlt, setImageAlt] = useState(initialImageAlt ?? sizeGuideName);
    const [savedImageAlt, setSavedImageAlt] = useState(
        initialImageAlt ?? sizeGuideName,
    );
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        initialImageUrl,
    );
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const altDirty = imageAlt !== savedImageAlt;

    useEffect(() => {
        if (!success) {
            return;
        }

        const timeout = setTimeout(() => setSuccess(null), 3000);

        return () => clearTimeout(timeout);
    }, [success]);

    const handleFileChange = (file: File | null) => {
        setPendingFile(file);
        setError(null);
        setSuccess(null);

        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(imageUrl);
        }
    };

    const handleUpload = async () => {
        if (!pendingFile) {
            return;
        }

        setProcessing(true);
        setError(null);
        setSuccess(null);

        try {
            const sizeGuide = await uploadSizeGuideImage(
                sizeGuideId,
                pendingFile,
                { imageAlt },
            );
            setImageUrl(sizeGuide.measureImageUrl ?? null);
            setPreviewUrl(sizeGuide.measureImageUrl ?? null);
            setSavedImageAlt(sizeGuide.measureImageAlt ?? imageAlt);
            setPendingFile(null);
            setSuccess(t('sizeGuides.imageUploadSuccess'));

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : t('sizeGuides.imageUploadFailed'),
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleSaveAlt = async () => {
        setProcessing(true);
        setError(null);
        setSuccess(null);

        try {
            const sizeGuide = await updateSizeGuideImageAlt(
                sizeGuideId,
                imageAlt,
            );
            setSavedImageAlt(sizeGuide.measureImageAlt ?? imageAlt);
            setSuccess(t('sizeGuides.imageAltSaved'));
        } catch (altError) {
            setError(
                altError instanceof Error
                    ? altError.message
                    : t('sizeGuides.imageAltSaveFailed'),
            );
        } finally {
            setProcessing(false);
        }
    };

    const handleRemove = async () => {
        setProcessing(true);
        setError(null);
        setSuccess(null);

        try {
            await deleteSizeGuideImage(sizeGuideId);
            setImageUrl(null);
            setPreviewUrl(null);
            setPendingFile(null);
            setSuccess(t('sizeGuides.imageRemoveSuccess'));

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (removeError) {
            setError(
                removeError instanceof Error
                    ? removeError.message
                    : t('sizeGuides.imageRemoveFailed'),
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <form onSubmit={saveContent}>
                <AdminFormSection title={t('sizeGuides.tabMeasure')}>
                    <RichTextEditor
                        label={t('sizeGuides.measureContent')}
                        value={form.data.measure_content}
                        onChange={(html) =>
                            form.setData('measure_content', html ?? '')
                        }
                        error={form.errors.measure_content}
                    />
                    <AdminButton type="submit" disabled={form.processing}>
                        {t('sizeGuides.saveMeasureContent')}
                    </AdminButton>
                </AdminFormSection>
            </form>

            <AdminFormSection title={t('sizeGuides.measureImageTitle')}>
                <p className="admin-caption text-admin-secondary -mt-2">
                    {t('sizeGuides.measureImageHint')}
                </p>

                <div className="grid grid-cols-1 gap-6 tablet:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] tablet:items-start">
                    <div className="rounded-admin-lg border-admin overflow-hidden border">
                        <div className="border-admin border-b bg-[var(--admin-neutral)] px-3 py-2">
                            <p className="admin-caption">
                                {t('sizeGuides.measureImagePreviewLabel')}
                            </p>
                        </div>
                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--admin-neutral)]">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt={imageAlt}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="text-admin-secondary flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
                                    <ImageIcon className="size-8 opacity-40" />
                                    <p className="text-xs">
                                        {t(
                                            'sizeGuides.noMeasureImagePreview',
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="admin-label">
                                {t('sizeGuides.measureImageFile')}
                            </label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="admin-input mt-1 block w-full text-sm"
                                onChange={(event) =>
                                    handleFileChange(
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                            />
                            <p className="admin-caption text-admin-secondary mt-1.5">
                                {t('sizeGuides.measureImageFileHint')}
                            </p>
                        </div>

                        <AdminInputField
                            label={t('sizeGuides.measureImageAlt')}
                            value={imageAlt}
                            onChange={(event) => {
                                setImageAlt(event.target.value);
                                setSuccess(null);
                            }}
                            hint={t('sizeGuides.measureImageAltHint')}
                        />

                        {error && (
                            <p className="admin-caption text-red-600">
                                {error}
                            </p>
                        )}
                        {success && (
                            <p className="admin-caption text-green-700">
                                {success}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <AdminButton
                                type="button"
                                disabled={processing || !pendingFile}
                                onClick={handleUpload}
                            >
                                {t('sizeGuides.uploadImage')}
                            </AdminButton>
                            {altDirty && imageUrl && (
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    disabled={processing}
                                    onClick={handleSaveAlt}
                                >
                                    {t('sizeGuides.saveImageAlt')}
                                </AdminButton>
                            )}
                            {imageUrl && (
                                <AdminButton
                                    type="button"
                                    variant="secondary"
                                    disabled={processing}
                                    onClick={handleRemove}
                                >
                                    {t('sizeGuides.removeImage')}
                                </AdminButton>
                            )}
                        </div>
                    </div>
                </div>
            </AdminFormSection>
        </div>
    );
}
