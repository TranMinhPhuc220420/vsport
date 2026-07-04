export type CategoryTreeRow = {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    parentName?: string | null;
    productsCount: number;
    childrenCount: number;
    imageUrl?: string | null;
    imageAlt?: string | null;
};

export type CategoryTreeNode = CategoryTreeRow & {
    children: CategoryTreeNode[];
};

export type FlatCategoryTreeRow = CategoryTreeRow & {
    depth: number;
    hasChildren: boolean;
    isExpanded: boolean;
};

export type CategoryScope = 'all' | 'roots' | 'children';

export function buildCategoryTree(flatRows: CategoryTreeRow[]): CategoryTreeNode[] {
    const nodes = new Map<number, CategoryTreeNode>();

    for (const row of flatRows) {
        nodes.set(row.id, { ...row, children: [] });
    }

    const roots: CategoryTreeNode[] = [];

    for (const node of nodes.values()) {
        if (node.parentId === null || !nodes.has(node.parentId)) {
            roots.push(node);
            continue;
        }

        nodes.get(node.parentId)?.children.push(node);
    }

    const sortNodes = (items: CategoryTreeNode[]): CategoryTreeNode[] =>
        items
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => ({
                ...item,
                children: sortNodes(item.children),
            }));

    return sortNodes(roots);
}

export function flattenCategoryTree(
    roots: CategoryTreeNode[],
    expandedIds: Set<number>,
): FlatCategoryTreeRow[] {
    const rows: FlatCategoryTreeRow[] = [];

    const walk = (nodes: CategoryTreeNode[], depth: number) => {
        for (const node of nodes) {
            const hasChildren = node.children.length > 0;
            const isExpanded = expandedIds.has(node.id);

            rows.push({
                id: node.id,
                name: node.name,
                slug: node.slug,
                parentId: node.parentId,
                parentName: node.parentName,
                productsCount: node.productsCount,
                childrenCount: node.childrenCount,
                imageUrl: node.imageUrl,
                imageAlt: node.imageAlt,
                depth,
                hasChildren,
                isExpanded,
            });

            if (hasChildren && isExpanded) {
                walk(node.children, depth + 1);
            }
        }
    };

    walk(roots, 0);

    return rows;
}

export function getDefaultExpandedIds(roots: CategoryTreeNode[]): Set<number> {
    return new Set(roots.map((root) => root.id));
}

export function filterCategoryTree(
    roots: CategoryTreeNode[],
    search: string | null,
    scope: CategoryScope,
): { roots: CategoryTreeNode[]; expandedIds: Set<number> } {
    const normalizedSearch = search?.trim().toLowerCase() ?? '';

    const matchesSearch = (node: CategoryTreeNode): boolean => {
        if (normalizedSearch === '') {
            return true;
        }

        return (
            node.name.toLowerCase().includes(normalizedSearch) ||
            node.slug.toLowerCase().includes(normalizedSearch)
        );
    };

    const matchesScope = (node: CategoryTreeNode): boolean => {
        if (scope === 'all') {
            return true;
        }

        if (scope === 'roots') {
            return node.parentId === null;
        }

        return node.parentId !== null;
    };

    const filterNodes = (
        nodes: CategoryTreeNode[],
    ): { filtered: CategoryTreeNode[]; expandedIds: Set<number> } => {
        const expandedIds = new Set<number>();
        const filtered: CategoryTreeNode[] = [];

        for (const node of nodes) {
            const childResult = filterNodes(node.children);
            const selfMatches =
                matchesSearch(node) && matchesScope(node);
            const hasMatchingChildren = childResult.filtered.length > 0;

            if (selfMatches || hasMatchingChildren) {
                filtered.push({
                    ...node,
                    children: childResult.filtered,
                });

                if (hasMatchingChildren) {
                    expandedIds.add(node.id);
                }

                childResult.expandedIds.forEach((id) => expandedIds.add(id));
            }
        }

        return { filtered, expandedIds };
    };

    if (normalizedSearch === '' && scope === 'all') {
        return {
            roots,
            expandedIds: getDefaultExpandedIds(roots),
        };
    }

    const { filtered, expandedIds } = filterNodes(roots);

    if (normalizedSearch === '' && scope !== 'all') {
        return {
            roots: filtered,
            expandedIds: getDefaultExpandedIds(filtered),
        };
    }

    return { roots: filtered, expandedIds };
}
