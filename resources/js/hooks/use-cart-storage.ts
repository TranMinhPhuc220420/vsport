import { useCallback, useEffect, useState } from 'react';

import {
    addServerCartItem,
    fetchServerCart,
    removeServerCartItem,
    updateServerCartItem,
} from '@/lib/cart-api';
import { CART_STORAGE_KEY } from '@/types/cart';
import type { CartItem, CartState } from '@/types/cart';

function readLocalCart(): CartState {
    if (typeof window === 'undefined') {
        return { items: [] };
    }

    try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);

        if (!raw) {
            return { items: [] };
        }

        const parsed = JSON.parse(raw) as CartState;

        if (!Array.isArray(parsed.items)) {
            return { items: [] };
        }

        return { items: parsed.items };
    } catch {
        return { items: [] };
    }
}

function writeLocalCart(state: CartState): void {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
}

function applyCartState(
    setItems: (items: CartItem[]) => void,
    setItemCount: (count: number) => void,
    setSubtotal: (subtotal: number) => void,
    cart: { items: CartItem[]; itemCount: number; subtotal: number },
): void {
    setItems(cart.items);
    setItemCount(cart.itemCount);
    setSubtotal(cart.subtotal);
    writeLocalCart({ items: cart.items });
}

function useCartStorage() {
    const local = readLocalCart();
    const [items, setItems] = useState<CartItem[]>(local.items);
    const [itemCount, setItemCount] = useState(() =>
        local.items.reduce((sum, item) => sum + item.quantity, 0),
    );
    const [subtotal, setSubtotal] = useState(() =>
        local.items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0,
        ),
    );
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetchServerCart()
            .then((cart) => {
                if (!cancelled) {
                    applyCartState(setItems, setItemCount, setSubtotal, cart);
                }
            })
            .catch(() => {
                // Keep local cache when API is unavailable.
            })
            .finally(() => {
                if (!cancelled) {
                    setReady(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const addItem = useCallback(
        async (input: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
            const quantity = input.quantity ?? 1;

            try {
                const existing = items.find(
                    (item) => item.variantId === input.variantId,
                );
                const nextQuantity = existing
                    ? existing.quantity + quantity
                    : quantity;

                const cart = await addServerCartItem({
                    variantId: input.variantId,
                    quantity: nextQuantity,
                    customConfiguration: input.customConfiguration,
                });

                applyCartState(setItems, setItemCount, setSubtotal, cart);
            } catch {
                setItems((current) => {
                    const existing = current.find(
                        (item) => item.variantId === input.variantId,
                    );

                    const next = existing
                        ? current.map((item) =>
                              item.variantId === input.variantId
                                  ? {
                                        ...item,
                                        quantity: item.quantity + quantity,
                                    }
                                  : item,
                          )
                        : [...current, { ...input, quantity }];

                    writeLocalCart({ items: next });

                    return next;
                });
            }
        },
        [items],
    );

    const updateQuantity = useCallback(
        async (variantId: number, quantity: number) => {
            if (quantity < 1) {
                return;
            }

            try {
                const cart = await updateServerCartItem(variantId, quantity);
                applyCartState(setItems, setItemCount, setSubtotal, cart);
            } catch {
                setItems((current) => {
                    const next = current.map((item) =>
                        item.variantId === variantId
                            ? { ...item, quantity }
                            : item,
                    );
                    writeLocalCart({ items: next });

                    return next;
                });
            }
        },
        [],
    );

    const removeItem = useCallback(async (variantId: number) => {
        try {
            const cart = await removeServerCartItem(variantId);
            applyCartState(setItems, setItemCount, setSubtotal, cart);
        } catch {
            setItems((current) => {
                const next = current.filter(
                    (item) => item.variantId !== variantId,
                );
                writeLocalCart({ items: next });

                return next;
            });
        }
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        setItemCount(0);
        setSubtotal(0);
        writeLocalCart({ items: [] });
    }, []);

    return {
        items,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        ready,
    };
}

export { useCartStorage };
