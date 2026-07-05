export type BlogHeading = {
    id: string;
    level: 2 | 3;
    text: string;
};

function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

export function injectBlogHeadingIds(html: string): {
    html: string;
    headings: BlogHeading[];
} {
    if (!html.trim()) {
        return { html, headings: [] };
    }

    const headings: BlogHeading[] = [];
    const usedIds = new Set<string>();

    const processed = html.replace(
        /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
        (match, level: string, attrs: string, content: string) => {
            const text = content.replace(/<[^>]+>/g, '').trim();

            if (!text) {
                return match;
            }

            let id = slugify(text) || 'section';
            const baseId = id;
            let suffix = 1;

            while (usedIds.has(id)) {
                id = `${baseId}-${suffix++}`;
            }

            usedIds.add(id);
            headings.push({
                id,
                level: Number(level) as 2 | 3,
                text,
            });

            if (/\bid\s*=/.test(attrs)) {
                return match;
            }

            return `<h${level}${attrs} id="${id}">${content}</h${level}>`;
        },
    );

    return { html: processed, headings };
}
