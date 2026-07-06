import type { CartItem } from '@/types/cart';

function getCsrfToken(): string {
    if (typeof document === 'undefined') {
        return '';
    }

    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

type ApiCartItem = {
    variantId: number;
    productSlug: string;
    productName: string;
    options: Array<{ name: string; value: string }>;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    imageUrl?: string;
    customConfiguration?: Record<string, unknown> | null;
};

type ApiCartResponse = {
    data: {
        items: ApiCartItem[];
        itemCount: number;
        subtotal: number;
    };
};

function mapApiItem(item: ApiCartItem): CartItem {
    const options = item.options ?? [];

    return {
        variantId: item.variantId,
        productSlug: item.productSlug,
        productName: item.productName,
        colorName: options[0]?.value ?? '',
        size: options[1]?.value ?? options[0]?.value ?? '',
        options,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        imageUrl: item.imageUrl,
    };
}

async function parseCartResponse(response: Response): Promise<{
    items: CartItem[];
    itemCount: number;
    subtotal: number;
}> {
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message =
            typeof body.message === 'string'
                ? body.message
                : 'Unable to update cart.';

        throw new Error(message);
    }

    const json = (await response.json()) as ApiCartResponse;

    return {
        items: json.data.items.map(mapApiItem),
        itemCount: json.data.itemCount,
        subtotal: json.data.subtotal,
    };
}

function cartFetchInit(): RequestInit {
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

export async function fetchServerCart(): Promise<{
    items: CartItem[];
    itemCount: number;
    subtotal: number;
}> {
    const response = await fetch('/api/cart', cartFetchInit());

    return parseCartResponse(response);
}

export async function addServerCartItem(payload: {
    variantId: number;
    quantity: number;
    customConfiguration?: Record<string, unknown>;
}): Promise<{
    items: CartItem[];
    itemCount: number;
    subtotal: number;
}> {
    const response = await fetch('/api/cart/items', {
        ...cartFetchInit(),
        method: 'POST',
        body: JSON.stringify(payload),
    });

    return parseCartResponse(response);
}

export async function updateServerCartItem(
    variantId: number,
    quantity: number,
): Promise<{
    items: CartItem[];
    itemCount: number;
    subtotal: number;
}> {
    const response = await fetch(`/api/cart/items/${variantId}`, {
        ...cartFetchInit(),
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
    });

    return parseCartResponse(response);
}

export async function removeServerCartItem(variantId: number): Promise<{
    items: CartItem[];
    itemCount: number;
    subtotal: number;
}> {
    const response = await fetch(`/api/cart/items/${variantId}`, {
        ...cartFetchInit(),
        method: 'DELETE',
    });

    return parseCartResponse(response);
}
