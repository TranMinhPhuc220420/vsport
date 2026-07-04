export type CartOption = {
    name: string;
    value: string;
};

export type CartItem = {
    variantId: number;
    productSlug: string;
    productName: string;
    colorName: string;
    size: string;
    options?: CartOption[];
    unitPrice: number;
    imageUrl?: string;
    quantity: number;
    customConfiguration?: Record<string, unknown>;
};

export type CartState = {
    items: CartItem[];
};

export const CART_STORAGE_KEY = 'vsport:cart:v1';

export type AddCartItemInput = Omit<CartItem, 'quantity'> & {
    quantity?: number;
};
