export const WISHLIST_STORAGE_KEY = 'vsport:wishlist';

export type WishlistItem = {
    productSlug: string;
    productName: string;
    imageUrl?: string;
    price: number;
    salePrice?: number;
};

export type WishlistState = {
    items: WishlistItem[];
};
