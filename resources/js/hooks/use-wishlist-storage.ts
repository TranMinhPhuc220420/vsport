import { useCallback, useEffect, useState } from 'react';

import {
    WISHLIST_STORAGE_KEY,
    type WishlistItem,
    type WishlistState,
} from '@/types/wishlist';

function readLocalWishlist(): WishlistState {
    if (typeof window === 'undefined') {
        return { items: [] };
    }

    try {
        const raw = window.localStorage.getItem(WISHLIST_STORAGE_KEY);

        if (!raw) {
            return { items: [] };
        }

        const parsed = JSON.parse(raw) as WishlistState;

        if (!Array.isArray(parsed.items)) {
            return { items: [] };
        }

        return { items: parsed.items };
    } catch {
        return { items: [] };
    }
}

function writeLocalWishlist(state: WishlistState): void {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state));
}

function useWishlistStorage() {
    const local = readLocalWishlist();
    const [items, setItems] = useState<WishlistItem[]>(local.items);

    useEffect(() => {
        setItems(readLocalWishlist().items);
    }, []);

    const toggleItem = useCallback((input: WishlistItem) => {
        setItems((current) => {
            const exists = current.some(
                (item) => item.productSlug === input.productSlug,
            );
            const next = exists
                ? current.filter(
                      (item) => item.productSlug !== input.productSlug,
                  )
                : [...current, input];

            writeLocalWishlist({ items: next });

            return next;
        });
    }, []);

    const removeItem = useCallback((productSlug: string) => {
        setItems((current) => {
            const next = current.filter(
                (item) => item.productSlug !== productSlug,
            );

            writeLocalWishlist({ items: next });

            return next;
        });
    }, []);

    const isWishlisted = useCallback(
        (productSlug: string) =>
            items.some((item) => item.productSlug === productSlug),
        [items],
    );

    return {
        items,
        itemCount: items.length,
        toggleItem,
        removeItem,
        isWishlisted,
    };
}

export { useWishlistStorage };
