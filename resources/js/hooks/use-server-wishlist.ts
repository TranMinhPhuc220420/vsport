import { useCallback, useEffect, useRef, useState } from 'react';

import {
    clearLocalWishlist,
    readLocalWishlist,
} from '@/hooks/use-wishlist-storage';
import {
    addServerWishlistItem,
    fetchServerWishlist,
    mergeServerWishlist,
    removeServerWishlistItem,
} from '@/lib/wishlist-api';
import type { WishlistItem } from '@/types/wishlist';

function useServerWishlist(enabled: boolean) {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const bootstrapped = useRef(false);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let cancelled = false;

        async function bootstrap(): Promise<void> {
            const localSlugs = readLocalWishlist().items.map(
                (item) => item.productSlug,
            );

            try {
                const merged =
                    localSlugs.length > 0
                        ? await mergeServerWishlist(localSlugs)
                        : await fetchServerWishlist();

                if (localSlugs.length > 0) {
                    clearLocalWishlist();
                }

                if (!cancelled) {
                    setItems(merged);
                }
            } catch {
                // Keep an empty wishlist if the server is unreachable.
            }
        }

        if (!bootstrapped.current) {
            bootstrapped.current = true;
            bootstrap();
        }

        return () => {
            cancelled = true;
        };
    }, [enabled]);

    const toggleItem = useCallback(
        (input: WishlistItem) => {
            const exists = items.some(
                (item) => item.productSlug === input.productSlug,
            );

            setItems((current) =>
                exists
                    ? current.filter(
                          (item) => item.productSlug !== input.productSlug,
                      )
                    : [...current, input],
            );

            const request = exists
                ? removeServerWishlistItem(input.productSlug)
                : addServerWishlistItem(input.productSlug);

            request.then(setItems).catch(() =>
                fetchServerWishlist()
                    .then(setItems)
                    .catch(() => {}),
            );
        },
        [items],
    );

    const removeItem = useCallback((productSlug: string) => {
        setItems((current) =>
            current.filter((item) => item.productSlug !== productSlug),
        );

        removeServerWishlistItem(productSlug)
            .then(setItems)
            .catch(() =>
                fetchServerWishlist()
                    .then(setItems)
                    .catch(() => {}),
            );
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

export { useServerWishlist };
