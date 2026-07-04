<?php

namespace App\Data;

use App\Models\Product;

readonly class ProductStructuredData
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function forProductPage(Product $product, ?string $primaryImage = null): array
    {
        return [
            self::product($product, $primaryImage),
            self::breadcrumbList($product),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function product(Product $product, ?string $primaryImage = null): array
    {
        $app = config('app.name', 'Zova Sport');
        $images = self::collectImages($product, $primaryImage);
        $description = PageSeo::truncate($product->description)
            ?: __('seo.product.fallback_description', ['name' => $product->name, 'app' => $app]);

        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product->name,
            'description' => $description,
            'sku' => $product->style_code,
            'url' => route('products.show', $product->slug),
            'image' => $images,
            'offers' => [
                '@type' => 'Offer',
                'url' => route('products.show', $product->slug),
                'priceCurrency' => 'USD',
                'price' => (float) $product->base_price,
                'availability' => self::isInStock($product)
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
            ],
        ];

        if ($product->review_count > 0) {
            $data['aggregateRating'] = [
                '@type' => 'AggregateRating',
                'ratingValue' => (float) $product->average_rating,
                'reviewCount' => $product->review_count,
            ];
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    public static function breadcrumbList(Product $product): array
    {
        $product->loadMissing('category.parent');
        $category = $product->category;

        $items = [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => __('seo.breadcrumb.home'),
                'item' => route('home'),
            ],
        ];

        $position = 2;

        if ($category?->parent) {
            $items[] = [
                '@type' => 'ListItem',
                'position' => $position++,
                'name' => $category->parent->name,
                'item' => route('category.show', $category->parent->slug),
            ];
        }

        if ($category) {
            $items[] = [
                '@type' => 'ListItem',
                'position' => $position++,
                'name' => $category->name,
                'item' => route('category.show', $category->slug),
            ];
        }

        $items[] = [
            '@type' => 'ListItem',
            'position' => $position,
            'name' => $product->name,
            'item' => route('products.show', $product->slug),
        ];

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $items,
        ];
    }

    /**
     * @return list<string>
     */
    private static function collectImages(Product $product, ?string $primaryImage): array
    {
        $images = [];

        foreach ($product->activeColorways as $colorway) {
            foreach ($colorway->images as $image) {
                if ($image->image_url !== null && $image->image_url !== '') {
                    $images[] = $image->image_url;
                }
            }
        }

        if ($images === [] && $primaryImage !== null && $primaryImage !== '') {
            $images[] = $primaryImage;
        }

        return $images;
    }

    private static function isInStock(Product $product): bool
    {
        foreach ($product->activeColorways as $colorway) {
            foreach ($colorway->variants as $variant) {
                if ($variant->inventory?->isInStock()) {
                    return true;
                }
            }
        }

        return false;
    }
}
