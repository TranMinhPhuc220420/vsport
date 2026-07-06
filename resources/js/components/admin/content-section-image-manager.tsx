import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AdminConfirmDialog } from '@/components/admin/admin-confirm-dialog';
import { AdminButton } from '@/components/admin/ui/admin-button';
import { adminInputClassName } from '@/components/admin/ui/admin-input-styles';
import { AdminRowActionLink } from '@/components/admin/ui/admin-row-action-link';
import {
    deleteContentSectionImage,
    reorderContentSectionImages,
    updateContentSectionImage,
    uploadContentSectionImage,
} from '@/lib/admin-upload';
import type { AdminContentSectionImage } from '@/lib/admin-upload';
import { cn } from '@/lib/utils';

type ContentSectionImageManagerProps = {
    sectionId: number;
    sectionTitle: string;
    productName: string;
    initialImages: AdminContentSectionImage[];
};

function sortImages(
    images: AdminContentSectionImage[],
): AdminContentSectionImage[] {
    return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function ContentSectionImageManager({
    sectionId,
    sectionTitle,
    productName,
    initialImages,
}: ContentSectionImageManagerProps) {
    const { t } = useTranslation('admin');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [images, setImages] = useState(() => sortImages(initialImages));
    const [uploading, setUploading] = useState(false);
    const [busyImageId, setBusyImageId] = useState<number | null>(null);
    const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

    const defaultAlt = `${productName} - ${sectionTitle}`;

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) {
            return;
        }

        setUploading(true);

        try {
            const uploaded: AdminContentSectionImage[] = [];

            for (const file of files) {
                const image = await uploadContentSectionImage(sectionId, file, {
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

    const handleMove = async (imageId: number, direction: 'up' | 'down') => {
        const index = images.findIndex((image) => image.id === imageId);

        if (index === -1) {
            return;
        }

        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= images.length) {
            return;
        }

        const nextOrder = [...images];
        [nextOrder[index], nextOrder[targetIndex]] = [
            nextOrder[targetIndex],
            nextOrder[index],
        ];

        setBusyImageId(imageId);

        try {
            const reordered = await reorderContentSectionImages(
                sectionId,
                nextOrder.map((image) => image.id),
            );
            setImages(sortImages(reordered));
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

    const handleAltChange = async (imageId: number, alt: string) => {
        setBusyImageId(imageId);

        try {
            const updated = await updateContentSectionImage(imageId, {
                image_alt_tag: alt,
            });

            setImages((current) =>
                current.map((image) =>
                    image.id === updated.id ? updated : image,
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

    const handleDelete = async () => {
        if (deleteImageId === null) {
            return;
        }

        setBusyImageId(deleteImageId);

        try {
            await deleteContentSectionImage(deleteImageId);
            setImages((current) =>
                current.filter((image) => image.id !== deleteImageId),
            );
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : t('products.uploadFailed'),
            );
        } finally {
            setBusyImageId(null);
            setDeleteImageId(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                />
                <AdminButton
                    type="button"
                    variant="secondary"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {uploading
                        ? t('products.uploading')
                        : t('products.contentSectionImagesUpload')}
                </AdminButton>
            </div>

            {images.length === 0 ? (
                <p className="text-admin-secondary text-sm">
                    {t('products.contentSectionImagesEmpty')}
                </p>
            ) : (
                <div className="grid gap-4 tablet:grid-cols-2">
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            className="border-admin rounded-admin-lg overflow-hidden border"
                        >
                            <img
                                src={image.url}
                                alt={image.alt ?? defaultAlt}
                                className="aspect-[4/5] w-full object-cover"
                            />
                            <div className="space-y-3 p-3">
                                <input
                                    type="text"
                                    value={image.alt ?? ''}
                                    placeholder={t('products.imageAlt')}
                                    className={cn(
                                        adminInputClassName,
                                        'w-full',
                                    )}
                                    disabled={busyImageId === image.id}
                                    onChange={(event) => {
                                        const alt = event.target.value;
                                        setImages((current) =>
                                            current.map((item) =>
                                                item.id === image.id
                                                    ? { ...item, alt }
                                                    : item,
                                            ),
                                        );
                                    }}
                                    onBlur={(event) =>
                                        handleAltChange(
                                            image.id,
                                            event.target.value,
                                        )
                                    }
                                />
                                <div className="flex flex-wrap items-center gap-2">
                                    <AdminRowActionLink
                                        disabled={
                                            index === 0 ||
                                            busyImageId === image.id
                                        }
                                        onClick={() =>
                                            handleMove(image.id, 'up')
                                        }
                                    >
                                        <ChevronUp className="size-4" />
                                        {t('products.moveUp')}
                                    </AdminRowActionLink>
                                    <AdminRowActionLink
                                        disabled={
                                            index === images.length - 1 ||
                                            busyImageId === image.id
                                        }
                                        onClick={() =>
                                            handleMove(image.id, 'down')
                                        }
                                    >
                                        <ChevronDown className="size-4" />
                                        {t('products.moveDown')}
                                    </AdminRowActionLink>
                                    <AdminRowActionLink
                                        className="text-red-600"
                                        disabled={busyImageId === image.id}
                                        onClick={() =>
                                            setDeleteImageId(image.id)
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                        {t('products.deleteImage')}
                                    </AdminRowActionLink>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AdminConfirmDialog
                open={deleteImageId !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleteImageId(null);
                    }
                }}
                title={t('products.deleteImageConfirm')}
                variant="destructive"
                confirmLabel={t('products.deleteImage')}
                loading={
                    deleteImageId !== null && busyImageId === deleteImageId
                }
                onConfirm={() => void handleDelete()}
            />
        </div>
    );
}
