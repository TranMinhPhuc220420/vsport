import { useMemo, useState } from 'react';

export type UseRowSelectionReturn = {
    selectedIds: Set<number>;
    isSelected: (id: number) => boolean;
    toggle: (id: number) => void;
    toggleAll: () => void;
    allSelected: boolean;
    someSelected: boolean;
    clear: () => void;
    selectedCount: number;
};

/**
 * Client-side row selection for a paginated data table. Selection is scoped
 * to the rows currently on the page and is expected to reset on navigation
 * (server-side pagination already reloads the page, which remounts callers).
 */
export function useRowSelection<T extends { id: number }>(
    rows: T[],
): UseRowSelectionReturn {
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const rowIds = useMemo(() => rows.map((row) => row.id), [rows]);

    const isSelected = (id: number) => selectedIds.has(id);

    const toggle = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }

            return next;
        });
    };

    const toggleAll = () => {
        setSelectedIds((prev) => {
            const allCurrentlySelected =
                rowIds.length > 0 && rowIds.every((id) => prev.has(id));

            return allCurrentlySelected ? new Set() : new Set(rowIds);
        });
    };

    const clear = () => setSelectedIds(new Set());

    const allSelected =
        rowIds.length > 0 && rowIds.every((id) => selectedIds.has(id));
    const someSelected = selectedIds.size > 0 && !allSelected;

    return {
        selectedIds,
        isSelected,
        toggle,
        toggleAll,
        allSelected,
        someSelected,
        clear,
        selectedCount: selectedIds.size,
    };
}
