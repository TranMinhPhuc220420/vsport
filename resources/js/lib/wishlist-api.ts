import type { WishlistItem } from '@/types/wishlist';

function getCsrfToken(): string {
    if (typeof document === 'undefined') {
        return '';
    }

    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

type ApiWishlistItem = {
    productSlug: string;
    productName: string;
    imageUrl?: string | null;
    price: number;
    salePrice?: number | null;
};

type ApiWishlistResponse = {
    data: {
        items: ApiWishlistItem[];
    };
};

function mapApiItem(item: ApiWishlistItem): WishlistItem {
    return {
        productSlug: item.productSlug,
        productName: item.productName,
        imageUrl: item.imageUrl ?? undefined,
        price: item.price,
        salePrice: item.salePrice ?? undefined,
    };
}

async function parseWishlistResponse(response: Response): Promise<WishlistItem[]> {
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message =
            typeof body.message === 'string'
                ? body.message
                : 'Unable to update wishlist.';

        throw new Error(message);
    }

    const json = (await response.json()) as ApiWishlistResponse;

    return json.data.items.map(mapApiItem);
}

function wishlistFetchInit(): RequestInit {
    return {
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
    };
}

export async function fetchServerWishlist(): Promise<WishlistItem[]> {
    const response = await fetch('/api/wishlist', wishlistFetchInit());

    return parseWishlistResponse(response);
}

export async function addServerWishlistItem(
    productSlug: string,
): Promise<WishlistItem[]> {
    const response = await fetch('/api/wishlist/items', {
        ...wishlistFetchInit(),
        method: 'POST',
        body: JSON.stringify({ productSlug }),
    });

    return parseWishlistResponse(response);
}

export async function removeServerWishlistItem(
    productSlug: string,
): Promise<WishlistItem[]> {
    const response = await fetch(
        `/api/wishlist/items/${encodeURIComponent(productSlug)}`,
        {
            ...wishlistFetchInit(),
            method: 'DELETE',
        },
    );

    return parseWishlistResponse(response);
}

export async function mergeServerWishlist(
    slugs: string[],
): Promise<WishlistItem[]> {
    const response = await fetch('/api/wishlist/merge', {
        ...wishlistFetchInit(),
        method: 'POST',
        body: JSON.stringify({ slugs }),
    });

    return parseWishlistResponse(response);
}
