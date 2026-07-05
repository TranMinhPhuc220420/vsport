import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(String(html || ''), {
        USE_PROFILES: { html: true },
    });
}

export function plainTextFromHtml(html: string, maxLen = 2000): string {
    const div = document.createElement('div');
    div.innerHTML = String(html || '');
    const text = (div.textContent || div.innerText || '')
        .replace(/[ \t]+/g, ' ')
        .trim();

    return maxLen > 0 && text.length > maxLen ? text.slice(0, maxLen) : text;
}

function escapeHtml(value: string): string {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function plainTextToHtml(text: string): string {
    const trimmed = String(text || '').trim();
    if (!trimmed) {
        return '';
    }

    return `<p>${escapeHtml(trimmed).replace(/\n/g, '<br>')}</p>`;
}

export function initialHtml({
    html,
    text,
}: {
    html?: string | null;
    text?: string | null;
}): string {
    const direct = String(html || '').trim();
    if (direct) {
        return sanitizeHtml(direct);
    }

    return plainTextToHtml(text || '');
}
