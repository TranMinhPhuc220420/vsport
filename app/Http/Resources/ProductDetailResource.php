<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Support\ColorSwatch;
use App\Support\SustainabilityCalculator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class ProductDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $calculator = app(SustainabilityCalculator::class);

        return [
            'id' => $this->id,
            'styleCode' => $this->style_code,
            'name' => $this->name,
            'slug' => $this->slug,
            'subTitle' => $this->sub_title,
            'description' => $this->description,
            'gender' => $this->gender->value,
            'basePrice' => (float) $this->base_price,
            'averageRating' => (float) $this->average_rating,
            'reviewCount' => $this->review_count,
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'reviews' => $this->whenLoaded('approvedReviews', fn () => $this->approvedReviews
                ->take(10)
                ->map(fn ($review) => [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'body' => $review->body,
                    'authorName' => $review->user?->name,
                    'createdAt' => $review->created_at?->toIso8601String(),
                ])),
            'colorways' => $this->activeColorways->map(fn ($colorway) => [
                'id' => $colorway->id,
                'colorwayCode' => $colorway->colorway_code,
                'fullStyleCode' => $colorway->full_style_code,
                'colorName' => $colorway->color_name,
                'isCustomizable' => $colorway->is_customizable,
                'swatchColor' => ColorSwatch::fromColorName($colorway->color_name),
                'effectivePrice' => $colorway->effectivePrice(),
                'discountPrice' => $colorway->discount_price !== null
                    ? (float) $colorway->discount_price
                    : null,
                'images' => ProductImageResource::collection($colorway->images)->resolve(),
                'variants' => $colorway->variants->map(fn ($variant) => [
                    'id' => $variant->id,
                    'size' => $variant->size_val,
                    'sku' => $variant->sku,
                    'unitPrice' => $variant->unitPrice(),
                    'stock' => [
                        'available' => $variant->inventory?->availableQuantity() ?? 0,
                        'inStock' => $variant->inventory?->isInStock() ?? false,
                    ],
                ]),
                'sustainability' => [
                    'weightedRecycledPercent' => $calculator->weightedRecycledPercent($colorway->sustainabilityMaterials),
                    'materials' => $colorway->sustainabilityMaterials->map(fn ($material) => [
                        'componentName' => $material->component_name,
                        'materialType' => $material->material_type,
                        'componentWeightG' => $material->component_weight_g,
                        'recycledContentPct' => $material->recycled_content_pct,
                    ]),
                ],
                'customizationOptions' => $colorway->is_customizable
                    ? $colorway->nikeByYouOptions->map(fn ($option) => [
                        'componentName' => $option->component_name,
                        'allowedMaterials' => $option->allowed_materials,
                        'allowedColors' => $option->allowed_colors,
                    ])
                    : [],
            ]),
        ];
    }
}
