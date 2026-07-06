import { ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminInputField } from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';
import {
    deleteCategoryImage,
    updateCategoryImageAlt,
    uploadCategoryImage,
} from '@/lib/admin-upload';

type CategoryImageEditorProps = {
    categoryId: number;
    initialImageUrl: string | null;
    initialImageAlt: string | null;
    categoryName: string;
};

export function CategoryImageEditor({
    categoryId,
    initialImageUrl,
    initialImageAlt,
    categoryName,
}: CategoryImageEditorProps) {
    const { t } = useTranslation('admin');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageUrl, setImageUrl] = useState(initialImageUrl);
    const [imageAlt, setImageAlt] = useState(initialImageAlt ?? categoryName);
    const [savedImageAlt, setSavedImageAlt] = useState(
        initialImageAlt ?? categoryName,
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
            const category = await uploadCategoryImage(
                categoryId,
                pendingFile,
                { imageAlt },
            );
            setImageUrl(category.imageUrl ?? null);
            setPreviewUrl(category.imageUrl ?? null);
            setSavedImageAlt(category.imageAlt ?? imageAlt);
            setPendingFile(null);
            setSuccess(t('categories.imageUploadSuccess'));

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : t('categories.imageUploadFailed'),
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
            const category = await updateCategoryImageAlt(categoryId, imageAlt);
            setSavedImageAlt(category.imageAlt ?? imageAlt);
            setSuccess(t('categories.imageAltSaved'));
        } catch (altError) {
            setError(
                altError instanceof Error
                    ? altError.message
                    : t('categories.imageAltSaveFailed'),
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
            await deleteCategoryImage(categoryId);
            setImageUrl(null);
            setPreviewUrl(null);
            setPendingFile(null);
            setSuccess(t('categories.imageRemoveSuccess'));

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (removeError) {
            setError(
                removeError instanceof Error
                    ? removeError.message
                    : t('categories.imageRemoveFailed'),
            );
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminFormSection title={t('categories.imageTitle')}>
            <p className="admin-caption text-admin-secondary -mt-2">
                {t('categories.imageHint')}
            </p>

            <div className="grid grid-cols-1 gap-6 tablet:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] tablet:items-start">
                <div className="rounded-admin-lg border-admin overflow-hidden border">
                    <div className="border-admin border-b bg-[var(--admin-neutral)] px-3 py-2">
                        <p className="admin-caption">
                            {t('categories.imagePreviewLabel')}
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
                                    {t('categories.noImagePreview')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="admin-label">
                            {t('categories.imageFile')}
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
                            {t('categories.imageFileHint')}
                        </p>
                    </div>

                    <AdminInputField
                        label={t('categories.imageAlt')}
                        value={imageAlt}
                        onChange={(event) => {
                            setImageAlt(event.target.value);
                            setSuccess(null);
                        }}
                        hint={t('categories.imageAltHint')}
                    />

                    {error && (
                        <p className="admin-caption text-red-600">{error}</p>
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
                            {t('categories.uploadImage')}
                        </AdminButton>
                        {altDirty && imageUrl && (
                            <AdminButton
                                type="button"
                                variant="secondary"
                                disabled={processing}
                                onClick={handleSaveAlt}
                            >
                                {t('categories.saveImageAlt')}
                            </AdminButton>
                        )}
                        {imageUrl && (
                            <AdminButton
                                type="button"
                                variant="secondary"
                                disabled={processing}
                                onClick={handleRemove}
                            >
                                {t('categories.removeImage')}
                            </AdminButton>
                        )}
                    </div>
                </div>
            </div>
        </AdminFormSection>
    );
}
