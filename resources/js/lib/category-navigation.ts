import type { Category } from '@/types/catalog';

/**
 * Normalize category children from Inertia props.
 * Guards against legacy ResourceCollection objects that were not fully resolved.
 */
export function getCategoryChildren(category: Category): Category[] {
    const children = category.children;

    if (children === undefined || children === null) {
        return [];
    }

    if (Array.isArray(children)) {
        return children;
    }

    if (
        typeof children === 'object' &&
        'data' in children &&
        Array.isArray((children as { data: Category[] }).data)
    ) {
        return (children as { data: Category[] }).data;
    }

    return Object.values(children as Record<string, Category>);
}

export function categoryHasChildren(category: Category): boolean {
    return getCategoryChildren(category).length > 0;
}
