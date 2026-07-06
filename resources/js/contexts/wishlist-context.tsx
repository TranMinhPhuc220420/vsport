import { usePage } from '@inertiajs/react';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

import { useServerWishlist } from '@/hooks/use-server-wishlist';
import { useWishlistStorage } from '@/hooks/use-wishlist-storage';
import type { User } from '@/types/auth';
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
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const isAuthenticated = auth.user !== null;

    const local = useWishlistStorage();
    const server = useServerWishlist(isAuthenticated);
    const wishlist = isAuthenticated ? server : local;

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
