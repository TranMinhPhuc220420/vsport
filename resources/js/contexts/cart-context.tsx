import {
    createContext,
    useContext,
    type ReactNode,
} from 'react';

import { useCartStorage } from '@/hooks/use-cart-storage';
import type { CartItem } from '@/types/cart';

type CartContextValue = {
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    ready: boolean;
    addItem: (
        input: Omit<CartItem, 'quantity'> & { quantity?: number },
    ) => void;
    updateQuantity: (variantId: number, quantity: number) => void;
    removeItem: (variantId: number) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function CartProvider({ children }: { children: ReactNode }) {
    const cart = useCartStorage();

    return (
        <CartContext.Provider value={cart}>{children}</CartContext.Provider>
    );
}

function useCart(): CartContextValue {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }

    return context;
}

export { CartProvider, useCart };
