export function plpUrl(slug: string, sort?: string): string {
    const params = sort && sort !== 'newest' ? `?sort=${sort}` : '';

    return `/${slug}${params}`;
}
