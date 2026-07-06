import { useMemo } from 'react';

import { sanitizeHtml } from '@/lib/richtext';
import { cn } from '@/lib/utils';

import './rich-text-renderer.css';

type RichTextRendererProps = {
    html?: string | null;
    fallbackText?: string | null;
    className?: string;
};

export function RichTextRenderer({
    html,
    fallbackText,
    className,
}: RichTextRendererProps) {
    const safeHtml = useMemo(() => {
        const direct = String(html || '').trim();

        if (direct) {
            return sanitizeHtml(direct);
        }

        return '';
    }, [html]);

    const showFallback = !safeHtml && String(fallbackText || '').trim() !== '';

    if (safeHtml) {
        return (
            <div
                className={cn('rich-text-renderer', className)}
                dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
        );
    }

    if (showFallback) {
        return (
            <div className={cn('text-sm whitespace-pre-wrap', className)}>
                {fallbackText}
            </div>
        );
    }

    return null;
}
