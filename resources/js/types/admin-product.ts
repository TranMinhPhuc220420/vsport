import type { AdminProductImage } from '@/lib/admin-upload';

export type ProductVariant = {
    id: number;
    size: string;
    sku: string;
    quantity: number;
    available: number;
};

export type ProductColorway = {
    id: number;
    colorwayCode: string;
    fullStyleCode: string;
    colorName: string;
    discountPrice: number | null;
    isActive: boolean;
    images: AdminProductImage[];
    variants: ProductVariant[];
};

export type AdminProduct = {
    id: number;
    styleCode: string;
    name: string;
    slug: string;
    description: string | null;
    categoryId: number;
    subTitle: string | null;
    basePrice: number;
    gender: string;
    colorways: ProductColorway[];
};

export function getPrimaryImageUrl(
    colorway: ProductColorway,
): string | null {
    const primary = colorway.images.find((img) => img.isPrimary);
    return primary?.url ?? colorway.images[0]?.url ?? null;
}

export function getProductTotalStock(product: AdminProduct): number {
    return product.colorways.reduce(
        (sum, colorway) =>
            sum +
            colorway.variants.reduce(
                (colorwaySum, variant) => colorwaySum + variant.available,
                0,
            ),
        0,
    );
}

export function productHasActiveColorway(product: AdminProduct): boolean {
    return product.colorways.some((colorway) => colorway.isActive);
}
