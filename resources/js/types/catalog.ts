export type ProductImage = {
    url: string;
    alt: string;
    isPrimary: boolean;
    sortOrder: number;
};

export type Category = {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
};

export type ProductSummary = {
    id: number;
    name: string;
    slug: string;
    subTitle: string | null;
    gender: string;
    category?: Category;
    basePrice: number;
    listPrice: number;
    salePrice: number | null;
    minPrice: number;
    maxPrice: number;
    inStock: boolean;
    colorwaySwatches: string[];
    primaryImage: ProductImage | null;
};

export type ProductVariant = {
    id: number;
    size: string;
    sku: string;
    unitPrice: number;
    stock: {
        available: number;
        inStock: boolean;
    };
};

export type ProductColorway = {
    id: number;
    colorwayCode: string;
    fullStyleCode: string;
    colorName: string;
    isCustomizable?: boolean;
    swatchColor: string;
    effectivePrice: number;
    discountPrice: number | null;
    images: ProductImage[];
    variants: ProductVariant[];
    sustainability?: {
        weightedRecycledPercent: number;
        materials: Array<{
            componentName: string;
            materialType: string;
            componentWeightG: number;
            recycledContentPct: number;
        }>;
    };
    customizationOptions?: Array<{
        componentName: string;
        allowedMaterials: string[];
        allowedColors: Array<{ hex: string; name: string }>;
    }>;
};

export type ProductReview = {
    id: number;
    rating: number;
    title: string | null;
    body: string | null;
    authorName?: string;
    createdAt?: string;
};

export type ProductDetail = {
    id: number;
    styleCode: string;
    name: string;
    slug: string;
    subTitle: string | null;
    description: string | null;
    gender: string;
    basePrice: number;
    averageRating?: number;
    reviewCount?: number;
    reviews?: ProductReview[];
    category?: Category;
    colorways: ProductColorway[];
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginationMeta = {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
    links?: PaginationLink[];
};

export type Paginated<T> = {
    data: T[];
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: PaginationMeta;
};

export type Campaign = {
    headline: string;
    subtitle: string;
    imageUrl: string;
    ctaLabel: string;
    ctaHref: string;
};

export type CategoryMeta = {
    name: string;
    slug: string;
    breadcrumb: Array<{ name: string; slug: string }>;
};

export type ListingFilters = {
    category: string;
    gender: string | null;
    sort: string;
};

export type FilterOptions = {
    genders: string[];
    childCategories: Category[];
};
