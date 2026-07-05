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

export type AdminContentSectionImage = {
    id: number;
    url: string;
    alt: string | null;
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

export async function uploadOptionValueImage(
    optionValueId: number,
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

    const response = await fetch(`/admin/option-values/${optionValueId}/images`, {
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

/** @deprecated Use uploadOptionValueImage */
export async function uploadColorwayImage(
    optionValueId: number,
    file: File,
    options: UploadOptions = {},
): Promise<AdminProductImage> {
    return uploadOptionValueImage(optionValueId, file, options);
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

export async function reorderOptionValueImages(
    optionValueId: number,
    order: number[],
): Promise<AdminProductImage[]> {
    const response = await fetch(
        `/admin/option-values/${optionValueId}/images/reorder`,
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

/** @deprecated Use reorderOptionValueImages */
export async function reorderColorwayImages(
    optionValueId: number,
    order: number[],
): Promise<AdminProductImage[]> {
    return reorderOptionValueImages(optionValueId, order);
}

export type AdminCategoryImage = {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    imageUrl: string | null;
    imageAlt: string | null;
};

type CategoryImageUploadOptions = {
    imageAlt?: string;
};

export async function uploadCategoryImage(
    categoryId: number,
    file: File,
    options: CategoryImageUploadOptions = {},
): Promise<AdminCategoryImage> {
    const formData = new FormData();
    formData.append('image', file);

    if (options.imageAlt !== undefined) {
        formData.append('image_alt', options.imageAlt);
    }

    const response = await fetch(`/admin/categories/${categoryId}/image`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: formData,
        credentials: 'same-origin',
    });

    const payload = await parseJsonResponse<{ category: AdminCategoryImage }>(
        response,
    );

    return payload.category;
}

export async function deleteCategoryImage(categoryId: number): Promise<void> {
    const response = await fetch(`/admin/categories/${categoryId}/image`, {
        method: 'DELETE',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
    });

    if (!response.ok && response.status !== 204) {
        await parseJsonResponse(response);
    }
}

export async function updateCategoryImageAlt(
    categoryId: number,
    imageAlt: string,
): Promise<AdminCategoryImage> {
    const response = await fetch(
        `/admin/categories/${categoryId}/image-alt`,
        {
            method: 'PATCH',
            headers: jsonHeaders(),
            body: JSON.stringify({ image_alt: imageAlt }),
            credentials: 'same-origin',
        },
    );

    const payload = await parseJsonResponse<{ category: AdminCategoryImage }>(
        response,
    );

    return payload.category;
}

export async function uploadContentSectionImage(
    contentSectionId: number,
    file: File,
    options: UploadOptions = {},
): Promise<AdminContentSectionImage> {
    const formData = new FormData();
    formData.append('image', file);

    if (options.alt !== undefined) {
        formData.append('image_alt_tag', options.alt);
    }

    const response = await fetch(
        `/admin/content-sections/${contentSectionId}/images`,
        {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': getCsrfToken(),
            },
            body: formData,
            credentials: 'same-origin',
        },
    );

    const payload = await parseJsonResponse<{ image: AdminContentSectionImage }>(
        response,
    );

    return payload.image;
}

export async function updateContentSectionImage(
    imageId: number,
    payload: Pick<UpdatePayload, 'image_alt_tag' | 'sort_order'>,
): Promise<AdminContentSectionImage> {
    const response = await fetch(`/admin/content-section-images/${imageId}`, {
        method: 'PATCH',
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
        credentials: 'same-origin',
    });

    const body = await parseJsonResponse<{ image: AdminContentSectionImage }>(
        response,
    );

    return body.image;
}

export async function deleteContentSectionImage(imageId: number): Promise<void> {
    const response = await fetch(`/admin/content-section-images/${imageId}`, {
        method: 'DELETE',
        headers: jsonHeaders(),
        credentials: 'same-origin',
    });

    await parseJsonResponse<{ deleted: boolean }>(response);
}

export async function reorderContentSectionImages(
    contentSectionId: number,
    order: number[],
): Promise<AdminContentSectionImage[]> {
    const response = await fetch(
        `/admin/content-sections/${contentSectionId}/images/reorder`,
        {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify({ order }),
            credentials: 'same-origin',
        },
    );

    const body = await parseJsonResponse<{ images: AdminContentSectionImage[] }>(
        response,
    );

    return body.images;
}

export async function uploadRichtextImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/admin/uploads/richtext-image', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: formData,
        credentials: 'same-origin',
    });

    const payload = await parseJsonResponse<{ url: string }>(response);

    return payload.url;
}
