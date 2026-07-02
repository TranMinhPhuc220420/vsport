function getCsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export type AdminProductImage = {
    id: number;
    url: string;
    alt: string | null;
    isPrimary: boolean;
    sortOrder: number;
};

type UploadOptions = {
    alt?: string;
    isPrimary?: boolean;
};

type UpdatePayload = {
    image_alt_tag?: string | null;
    is_primary?: boolean;
    sort_order?: number;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let message = 'Request failed';

        try {
            const body = (await response.json()) as {
                message?: string;
                errors?: Record<string, string[]>;
            };
            message =
                body.message ??
                Object.values(body.errors ?? {})[0]?.[0] ??
                message;
        } catch {
            // ignore parse errors
        }

        throw new Error(message);
    }

    return (await response.json()) as T;
}

function jsonHeaders(): Record<string, string> {
    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': getCsrfToken(),
    };
}

export async function uploadColorwayImage(
    colorwayId: number,
    file: File,
    options: UploadOptions = {},
): Promise<AdminProductImage> {
    const formData = new FormData();
    formData.append('image', file);

    if (options.alt !== undefined) {
        formData.append('image_alt_tag', options.alt);
    }

    if (options.isPrimary !== undefined) {
        formData.append('is_primary', options.isPrimary ? '1' : '0');
    }

    const response = await fetch(`/admin/colorways/${colorwayId}/images`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: formData,
        credentials: 'same-origin',
    });

    const payload = await parseJsonResponse<{ image: AdminProductImage }>(
        response,
    );

    return payload.image;
}

export async function updateProductImage(
    imageId: number,
    payload: UpdatePayload,
): Promise<AdminProductImage> {
    const response = await fetch(`/admin/images/${imageId}`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
        credentials: 'same-origin',
    });

    const body = await parseJsonResponse<{ image: AdminProductImage }>(
        response,
    );

    return body.image;
}

export async function deleteProductImage(imageId: number): Promise<void> {
    const response = await fetch(`/admin/images/${imageId}`, {
        method: 'DELETE',
        headers: jsonHeaders(),
        credentials: 'same-origin',
    });

    await parseJsonResponse<{ deleted: boolean }>(response);
}

export async function reorderColorwayImages(
    colorwayId: number,
    order: number[],
): Promise<AdminProductImage[]> {
    const response = await fetch(
        `/admin/colorways/${colorwayId}/images/reorder`,
        {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify({ order }),
            credentials: 'same-origin',
        },
    );

    const body = await parseJsonResponse<{ images: AdminProductImage[] }>(
        response,
    );

    return body.images;
}
