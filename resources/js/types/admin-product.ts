import type {
    AdminContentSectionImage,
    AdminProductImage,
} from '@/lib/admin-upload';

export type AdminProductOptionValue = {
    id: number;
    value: string;
    slug: string;
    swatchHex?: string | null;
    salePrice?: number | null;
    metadata?: Record<string, unknown> | null;
    sortOrder: number;
    images: AdminProductImage[];
};

export type AdminProductOption = {
    id: number;
    name: string;
    position: number;
    displayType: 'swatch' | 'button' | 'dropdown';
    isRequired: boolean;
    drivesGallery: boolean;
    metadata?: Record<string, unknown> | null;
    values: AdminProductOptionValue[];
};

export type AdminProductVariant = {
    id: number;
    sku: string;
    optionValueIds: number[];
    optionLabels: string[];
    quantity: number;
    available: number;
};

export type AdminProductAttribute = {
    id?: number;
    group: string;
    key: string;
    label: string;
    value: string;
    sortOrder: number;
    optionValueId?: number | null;
};

export type AdminProductContentSection = {
    id: number;
    title: string;
    content: string | null;
    contentHtml: string | null;
    sortOrder: number;
    images: AdminContentSectionImage[];
};

export type AdminProduct = {
    id: number;
    styleCode: string;
    name: string;
    slug: string;
    description: string | null;
    descriptionHtml: string | null;
    categoryId: number;
    brandId: number | null;
    subTitle: string | null;
    basePrice: number;
    gender: string;
    isCustomizable: boolean;
    options: AdminProductOption[];
    variants: AdminProductVariant[];
    attributes: AdminProductAttribute[];
    contentSections: AdminProductContentSection[];
    customizationOptions: Array<{
        componentName: string;
        allowedMaterials: string[];
        allowedColors: Array<{ hex: string; name: string }>;
    }>;
};

export function getProductTotalStock(product: AdminProduct): number {
    return product.variants.reduce(
        (sum, variant) => sum + variant.available,
        0,
    );
}

export function productHasActiveVariants(product: AdminProduct): boolean {
    return product.variants.length > 0;
}

export function getGalleryOptionValues(
    product: AdminProduct,
): AdminProductOptionValue[] {
    const galleryOption =
        product.options.find((option) => option.drivesGallery) ??
        product.options.find((option) => option.displayType === 'swatch');

    return galleryOption?.values ?? [];
}
