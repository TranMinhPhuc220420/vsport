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
    imageUrl?: string | null;
    imageAlt?: string | null;
    children?: Category[];
};

export type ProductOptionValue = {
    id: number;
    value: string;
    slug: string;
    swatchHex?: string;
    salePrice?: number | null;
    metadata?: Record<string, unknown>;
    images?: ProductImage[];
};

export type ProductOption = {
    id: number;
    name: string;
    position: number;
    displayType: 'swatch' | 'button' | 'dropdown';
    isRequired: boolean;
    drivesGallery: boolean;
    metadata?: Record<string, unknown>;
    values: ProductOptionValue[];
};

export type ProductVariant = {
    id: number;
    sku: string;
    optionValueIds: number[];
    unitPrice: number;
    stock: {
        available: number;
        inStock: boolean;
    };
};

export type ProductColorway = {
    id: number;
    colorName: string;
    swatchColor: string;
    images: ProductImage[];
};

export type ProductAttribute = {
    key: string;
    label: string;
    value: string;
    optionValueId?: number | null;
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
    defaultVariantId?: number | null;
    defaultVariantPrice?: number | null;
};

export type ProductReview = {
    id: number;
    rating: number;
    title: string | null;
    body: string | null;
    authorName?: string;
    createdAt?: string;
    isApproved?: boolean;
};

export type ProductContentSectionImage = {
    id: number;
    url: string;
    alt: string | null;
    sortOrder: number;
};

export type ProductContentSection = {
    id: number;
    title: string;
    content: string | null;
    contentHtml: string | null;
    sortOrder?: number;
    images?: ProductContentSectionImage[];
};

export type SizeGuideRow = {
    id: number;
    position: number;
    values: string[];
};

export type SizeGuide = {
    id: number;
    name: string;
    columns: string[];
    rows: SizeGuideRow[];
    measureContentHtml: string | null;
    measureImageUrl?: string | null;
    measureImageAlt?: string | null;
};

export type ProductDetail = {
    id: number;
    styleCode: string;
    name: string;
    slug: string;
    subTitle: string | null;
    description: string | null;
    descriptionHtml: string | null;
    gender: string;
    basePrice: number;
    isCustomizable?: boolean;
    averageRating?: number;
    reviewCount?: number;
    reviews?: ProductReview[];
    viewerReview?: ProductReview | null;
    category?: Category;
    options: ProductOption[];
    variants: ProductVariant[];
    attributes?: Record<string, ProductAttribute[]>;
    contentSections?: ProductContentSection[];
    sizeGuide?: SizeGuide | null;
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
    sort: string;
    activeDepartment: string;
};

export type FilterOptions = {
    departments: Category[];
    subCategories: Category[];
};
