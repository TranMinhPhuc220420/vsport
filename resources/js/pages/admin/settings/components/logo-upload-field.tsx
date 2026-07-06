import { ImageIcon, UploadIcon } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminButton } from '@/components/admin/ui/admin-button';
import { cn } from '@/lib/utils';

type LogoUploadFieldProps = {
    label: string;
    hint?: string;
    previewUrl: string | null;
    variant: 'square' | 'wide';
    error?: string;
    onChange: (file: File | null) => void;
};

export function LogoUploadField({
    label,
    hint,
    previewUrl,
    variant,
    error,
    onChange,
}: LogoUploadFieldProps) {
    const { t } = useTranslation('admin');
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-2">
            <label className="admin-label">{label}</label>

            <div
                className={cn(
                    'rounded-admin-lg border-admin overflow-hidden border bg-[var(--admin-neutral)]',
                    variant === 'wide'
                        ? 'aspect-[3/1]'
                        : 'aspect-square max-w-[8rem]',
                )}
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt=""
                        className={cn(
                            'size-full',
                            variant === 'wide'
                                ? 'object-contain p-2'
                                : 'object-cover',
                        )}
                    />
                ) : (
                    <div className="text-admin-secondary flex size-full flex-col items-center justify-center gap-1.5 p-3 text-center">
                        <ImageIcon className="size-5 opacity-40" />
                        <span className="text-[0.65rem]">
                            {t('settings.noLogoPreview')}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <AdminButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadIcon className="size-3.5" />
                    {t('settings.chooseLogo')}
                </AdminButton>
                {previewUrl && (
                    <AdminButton
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            onChange(null);

                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                        }}
                    >
                        {t('settings.removeLogo')}
                    </AdminButton>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={(event) => onChange(event.target.files?.[0] ?? null)}
            />

            {hint && (
                <p className="admin-caption text-admin-secondary">{hint}</p>
            )}
            {error && <p className="admin-caption text-red-600">{error}</p>}
        </div>
    );
}
