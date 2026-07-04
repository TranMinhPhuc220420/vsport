import { ChevronDown, ChevronUp, Star, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminConfirmDialog } from '@/components/admin/admin-confirm-dialog';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { adminInputClassName } from '@/components/admin/ui/admin-input-styles';
import {
    deleteProductImage,
    reorderColorwayImages,
    updateProductImage,
    uploadColorwayImage,
} from '@/lib/admin-upload';
import type { AdminProductImage } from '@/lib/admin-upload';
import { cn } from '@/lib/utils';

type ColorwayImageManagerProps = {
    colorwayId: number;
    productName: string;
    colorName: string;
    initialImages: AdminProductImage[];
};

function sortImages(images: AdminProductImage[]): AdminProductImage[] {
    return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function ColorwayImageManager({
    colorwayId,
    productName,
    colorName,
    initialImages,
}: ColorwayImageManagerProps) {
    const { t } = useTranslation('admin');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState(() => sortImages(initialImages));
    const [uploading, setUploading] = useState(false);
    const [busyImageId, setBusyImageId] = useState<number | null>(null);
    const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

    const defaultAlt = `${productName} - ${colorName}`;

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) {
            return;
        }

        setUploading(true);

        try {
            const uploaded: AdminProductImage[] = [];

            for (const file of files) {
                const image = await uploadColorwayImage(colorwayId, file, {
                    alt: defaultAlt,
                });
                uploaded.push(image);
            }

            setImages((current) => sortImages([...current, ...uploaded]));
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t('products.uploadFailed'),
            );
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleSetPrimary = async (imageId: number) => {
        setBusyImageId(imageId);

        try {
            const updated = await updateProductImage(imageId, {
                is_primary: true,
            });

            setImages((current) =>
                sortImages(
                    current.map((image) => ({
                        ...image,
                        isPrimary:
                            image.id === updated.id ? updated.isPrimary : false,
                    })),
                ),
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t('products.uploadFailed'),
            );
        } finally {
            setBusyImageId(null);
        }
    };

    const handleAltBlur = async (image: AdminProductImage, alt: string) => {
        if (alt === (image.alt ?? '')) {
            return;
        }

        setBusyImageId(image.id);

        try {
            const updated = await updateProductImage(image.id, {
                image_alt_tag: alt || null,
            });

            setImages((current) =>
                current.map((item) =>
                    item.id === updated.id ? updated : item,
                ),
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t('products.uploadFailed'),
            );
        } finally {
            setBusyImageId(null);
        }
    };

    const confirmDeleteImage = async () => {
        if (deleteImageId === null) {
            return;
        }

        setBusyImageId(deleteImageId);

        try {
            await deleteProductImage(deleteImageId);
            const remaining = images.filter(
                (image) => image.id !== deleteImageId,
            );

            setImages(sortImages(remaining));
            setDeleteImageId(null);
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t('products.uploadFailed'),
            );
        } finally {
            setBusyImageId(null);
        }
    };

    const moveImage = async (imageId: number, direction: 'up' | 'down') => {
        const index = images.findIndex((image) => image.id === imageId);

        if (index < 0) {
            return;
        }

        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= images.length) {
            return;
        }

        const reordered = [...images];
        const [moved] = reordered.splice(index, 1);
        reordered.splice(targetIndex, 0, moved);

        setBusyImageId(imageId);

        try {
            const updated = await reorderColorwayImages(
                colorwayId,
                reordered.map((image) => image.id),
            );
            setImages(sortImages(updated));
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t('products.uploadFailed'),
            );
        } finally {
            setBusyImageId(null);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="admin-section-title">{t('products.images')}</h4>
                <AdminButton
                    type="button"
                    variant="secondary"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploading
                        ? t('products.uploading')
                        : t('products.imagesUpload')}
                </AdminButton>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleUpload}
            />

            {images.length === 0 ? (
                <p className="text-admin-secondary mt-3 text-sm">
                    {t('products.noImages')}
                </p>
            ) : (
                <div className="mt-4 grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className={cn(
                                'border-admin space-y-2 rounded-md border p-3',
                                image.isPrimary &&
                                    'ring-2 ring-[var(--admin-primary)]',
                            )}
                        >
                            <div className="relative">
                                <img
                                    src={image.url}
                                    alt={image.alt ?? ''}
                                    className="border-admin aspect-square w-full rounded-md border object-cover"
                                />
                                {image.isPrimary && (
                                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-[var(--admin-primary)] px-2 py-1 text-xs text-white">
                                        <Star className="size-3 fill-current" />
                                        {t('products.primaryImage')}
                                    </span>
                                )}
                            </div>

                            <label className="admin-label block">
                                {t('products.imageAlt')}
                                <input
                                    className={cn(
                                        'mt-1 w-full',
                                        adminInputClassName,
                                    )}
                                    defaultValue={image.alt ?? ''}
                                    disabled={busyImageId === image.id}
                                    onBlur={(event) =>
                                        void handleAltBlur(
                                            image,
                                            event.target.value,
                                        )
                                    }
                                />
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {!image.isPrimary && (
                                    <button
                                        type="button"
                                        className="text-sm text-[var(--admin-primary)] underline"
                                        disabled={busyImageId === image.id}
                                        onClick={() =>
                                            void handleSetPrimary(image.id)
                                        }
                                    >
                                        {t('products.setPrimary')}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-1 text-sm text-red-600 hover:underline"
                                    disabled={busyImageId === image.id}
                                    onClick={() => setDeleteImageId(image.id)}
                                >
                                    <Trash2 className="size-3.5" />
                                    {t('products.deleteImage')}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    className="text-admin-secondary inline-flex items-center gap-1 text-sm hover:text-[var(--admin-primary)] disabled:opacity-40"
                                    disabled={
                                        index === 0 || busyImageId === image.id
                                    }
                                    onClick={() => moveImage(image.id, 'up')}
                                >
                                    <ChevronUp className="size-4" />
                                    {t('products.moveUp')}
                                </button>
                                <button
                                    type="button"
                                    className="text-admin-secondary inline-flex items-center gap-1 text-sm hover:text-[var(--admin-primary)] disabled:opacity-40"
                                    disabled={
                                        index === images.length - 1 ||
                                        busyImageId === image.id
                                    }
                                    onClick={() => moveImage(image.id, 'down')}
                                >
                                    <ChevronDown className="size-4" />
                                    {t('products.moveDown')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AdminConfirmDialog
                open={deleteImageId !== null}
                onOpenChange={(open) => !open && setDeleteImageId(null)}
                title={t('products.deleteImageConfirm')}
                variant="destructive"
                confirmLabel={t('products.deleteImage')}
                loading={deleteImageId !== null && busyImageId === deleteImageId}
                onConfirm={() => void confirmDeleteImage()}
            />
        </div>
    );
}
