import { Facebook, Link2, Linkedin, Mail, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';

import { XIcon } from '@/components/icons/x-icon';
import { ZaloIcon } from '@/components/icons/zalo-icon';
import { cn } from '@/lib/utils';

type BlogShareActionsProps = {
    title: string;
    className?: string;
    showLabel?: boolean;
    tone?: 'default' | 'on-image';
};

type SharePlatform = 'facebook' | 'x' | 'linkedin' | 'zalo' | 'email';

function buildShareUrl(
    platform: SharePlatform,
    url: string,
    title: string,
): string {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    switch (platform) {
        case 'facebook':
            return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        case 'x':
            return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        case 'linkedin':
            return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        case 'zalo':
            return `https://zalo.me/share?url=${encodedUrl}`;
        case 'email':
            return `mailto:?subject=${encodedTitle}&body=${encodedUrl}`;
    }
}

export function BlogShareActions({
    title,
    className,
    showLabel = true,
    tone = 'default',
}: BlogShareActionsProps) {
    const { t } = useTranslation('storefront');
    const [copied, setCopied] = useState(false);
    const [shareUrl] = useState(() =>
        typeof window !== 'undefined' ? window.location.href : '',
    );
    const onImage = tone === 'on-image';

    const shareButtonClassName = cn(
        'flex size-10 items-center justify-center rounded-full border transition',
        onImage
            ? 'border-canvas/40 bg-canvas/10 text-canvas backdrop-blur-sm hover:border-canvas hover:bg-canvas/20'
            : 'border-hairline text-mute hover:border-ink hover:text-ink',
    );

    const platforms = useMemo(
        (): {
            id: SharePlatform;
            label: string;
            Icon: ComponentType<{ className?: string }>;
        }[] => [
            {
                id: 'facebook',
                label: t('blog.sharePlatforms.facebook'),
                Icon: Facebook,
            },
            { id: 'x', label: t('blog.sharePlatforms.x'), Icon: XIcon },
            {
                id: 'linkedin',
                label: t('blog.sharePlatforms.linkedin'),
                Icon: Linkedin,
            },
            {
                id: 'zalo',
                label: t('blog.sharePlatforms.zalo'),
                Icon: ZaloIcon,
            },
            { id: 'email', label: t('blog.sharePlatforms.email'), Icon: Mail },
        ],
        [t],
    );

    const handleCopyLink = async () => {
        if (!shareUrl) {
            return;
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const handleNativeShare = async () => {
        if (!shareUrl) {
            return;
        }

        if (typeof navigator.share !== 'function') {
            await handleCopyLink();

            return;
        }

        try {
            await navigator.share({
                title,
                url: shareUrl,
            });
        } catch {
            // User cancelled or share unavailable.
        }
    };

    const canNativeShare =
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function';

    return (
        <div
            data-slot="blog-share-actions"
            className={cn('flex flex-col items-start gap-3', className)}
        >
            {showLabel && (
                <p
                    className={cn(
                        'text-caption-md',
                        onImage ? 'text-canvas/70' : 'text-mute',
                    )}
                >
                    {t('blog.share')}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
                {shareUrl &&
                    platforms.map(({ id, label, Icon }) => (
                        <a
                            key={id}
                            href={buildShareUrl(id, shareUrl, title)}
                            target={id === 'email' ? undefined : '_blank'}
                            rel={
                                id === 'email'
                                    ? undefined
                                    : 'noopener noreferrer'
                            }
                            className={shareButtonClassName}
                            aria-label={t('blog.shareOn', { platform: label })}
                        >
                            <Icon className="size-4" aria-hidden />
                        </a>
                    ))}

                <button
                    type="button"
                    onClick={handleCopyLink}
                    className={shareButtonClassName}
                    aria-label={t('blog.copyLink')}
                >
                    <Link2 className="size-4" aria-hidden />
                </button>

                {canNativeShare && (
                    <button
                        type="button"
                        onClick={handleNativeShare}
                        className={shareButtonClassName}
                        aria-label={t('blog.shareMore')}
                    >
                        <Share2 className="size-4" aria-hidden />
                    </button>
                )}
            </div>

            {copied && (
                <span
                    className={cn(
                        'text-caption-md',
                        onImage ? 'text-canvas/70' : 'text-mute',
                    )}
                >
                    {t('blog.linkCopied')}
                </span>
            )}
        </div>
    );
}
