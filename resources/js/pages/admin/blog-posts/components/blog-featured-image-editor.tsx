import { ImageIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminInputField } from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { AdminButton } from '@/components/admin/ui/admin-button';
import {
    deleteBlogFeaturedImage,
    uploadBlogFeaturedImage,
} from '@/lib/admin-upload';

type BlogFeaturedImageEditorProps = {
    postSlug: string;
    initialImageUrl: string | null;
    initialImageAlt: string | null;
    postTitle: string;
    layout?: 'default' | 'sidebar';
};

export function BlogFeaturedImageEditor({
    postSlug,
    initialImageUrl,
    initialImageAlt,
    postTitle,
    layout = 'default',
}: BlogFeaturedImageEditorProps) {
    const { t } = useTranslation('admin');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageUrl, setImageUrl] = useState(initialImageUrl);
    const [imageAlt, setImageAlt] = useState(initialImageAlt ?? postTitle);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        initialImageUrl,
    );
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
            const post = await uploadBlogFeaturedImage(postSlug, pendingFile, {
                imageAlt,
            });
            setImageUrl(post.featuredImageUrl ?? null);
            setPreviewUrl(post.featuredImageUrl ?? null);
            setPendingFile(null);
            setSuccess(t('blogPosts.imageUploadSuccess'));

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : t('blogPosts.imageUploadFailed'),
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
            await deleteBlogFeaturedImage(postSlug);
            setImageUrl(null);
            setPreviewUrl(null);
            setPendingFile(null);
            setSuccess(t('blogPosts.imageRemoveSuccess'));

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (removeError) {
            setError(
                removeError instanceof Error
                    ? removeError.message
                    : t('blogPosts.imageRemoveFailed'),
            );
        } finally {
            setProcessing(false);
        }
    };

    const isSidebar = layout === 'sidebar';

    return (
        <AdminFormSection
            title={t('blogPosts.featuredImageTitle')}
            description={t('blogPosts.featuredImageHint')}
            className={isSidebar ? 'p-4' : undefined}
        >
            <div
                className={
                    isSidebar
                        ? 'space-y-4'
                        : 'grid grid-cols-1 gap-6 tablet:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] tablet:items-start'
                }
            >
                <div className="rounded-admin-lg border-admin overflow-hidden border">
                    {!isSidebar && (
                        <div className="border-admin border-b bg-[var(--admin-neutral)] px-3 py-2">
                            <p className="admin-caption">
                                {t('blogPosts.imagePreviewLabel')}
                            </p>
                        </div>
                    )}
                    <div className="relative aspect-video w-full overflow-hidden bg-[var(--admin-neutral)]">
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
                                    {t('blogPosts.noImagePreview')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="admin-label">
                            {t('blogPosts.imageFile')}
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
                    </div>

                    <AdminInputField
                        label={t('blogPosts.imageAlt')}
                        value={imageAlt}
                        onChange={(event) => setImageAlt(event.target.value)}
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
                            {t('blogPosts.uploadImage')}
                        </AdminButton>
                        {imageUrl && (
                            <AdminButton
                                type="button"
                                variant="secondary"
                                disabled={processing}
                                onClick={handleRemove}
                            >
                                {t('blogPosts.removeImage')}
                            </AdminButton>
                        )}
                    </div>
                </div>
            </div>
        </AdminFormSection>
    );
}
