import { ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type BlogFeaturedImageCreateFieldProps = {
    previewUrl: string | null;
    postTitle: string;
    onFileChange: (file: File | null) => void;
};

export function BlogFeaturedImageCreateField({
    previewUrl,
    postTitle,
    onFileChange,
}: BlogFeaturedImageCreateFieldProps) {
    const { t } = useTranslation('admin');

    return (
        <div className="space-y-3">
            <p className="admin-caption text-admin-secondary">
                {t('blogPosts.featuredImageCreateHint')}
            </p>
            <div className="rounded-admin-lg border-admin overflow-hidden border">
                <div className="relative aspect-video w-full overflow-hidden bg-[var(--admin-neutral)]">
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={postTitle}
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
            <div>
                <label className="admin-label">
                    {t('blogPosts.imageFile')}
                </label>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="admin-input mt-1 block w-full text-sm"
                    onChange={(event) =>
                        onFileChange(event.target.files?.[0] ?? null)
                    }
                />
            </div>
        </div>
    );
}
