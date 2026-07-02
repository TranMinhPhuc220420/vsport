import {
    createContext,
    useContext,
    type ReactNode,
} from 'react';

import { useWishlistStorage } from '@/hooks/use-wishlist-storage';
import type { WishlistItem } from '@/types/wishlist';

type WishlistContextValue = {
    items: WishlistItem[];
    itemCount: number;
    toggleItem: (input: WishlistItem) => void;
    removeItem: (productSlug: string) => void;
    isWishlisted: (productSlug: string) => boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function WishlistProvider({ children }: { children: ReactNode }) {
    const wishlist = useWishlistStorage();

    return (
        <WishlistContext.Provider value={wishlist}>
            {children}
        </WishlistContext.Provider>
    );
}

function useWishlist(): WishlistContextValue {
    const context = useContext(WishlistContext);

    if (!context) {
        throw new Error('useWishlist must be used within WishlistProvider');
    }

    return context;
}

export { WishlistProvider, useWishlist };
