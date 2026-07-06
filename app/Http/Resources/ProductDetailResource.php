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
            'descriptionHtml' => $this->description_html,
            'gender' => $this->gender->value,
            'basePrice' => (float) $this->base_price,
            'isCustomizable' => $this->is_customizable,
            'averageRating' => (float) $this->average_rating,
            'reviewCount' => $this->review_count,
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'brandName' => $this->whenLoaded('brand', fn () => $this->brand?->name),
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
            'viewerReview' => $this->when($request->user(), function () use ($request) {
                $review = $this->reviews()
                    ->where('user_id', $request->user()->id)
                    ->first();

                if ($review === null) {
                    return null;
                }

                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'body' => $review->body,
                    'isApproved' => $review->is_approved,
                    'createdAt' => $review->created_at?->toIso8601String(),
                ];
            }),
            'options' => $this->options->map(fn ($option) => [
                'id' => $option->id,
                'name' => $option->name,
                'position' => $option->position,
                'displayType' => $option->display_type->value,
                'isRequired' => $option->is_required,
                'drivesGallery' => $option->drives_gallery,
                'metadata' => $option->metadata,
                'values' => $option->values->map(fn ($value) => [
                    'id' => $value->id,
                    'value' => $value->value,
                    'slug' => $value->slug,
                    'swatchHex' => $value->swatch_hex ?? ColorSwatch::fromColorName($value->value),
                    'salePrice' => $value->sale_price !== null ? (float) $value->sale_price : null,
                    'metadata' => $value->metadata,
                    'images' => ProductImageResource::collection($value->images)->resolve(),
                ]),
            ]),
            'variants' => $this->variants->map(fn ($variant) => [
                'id' => $variant->id,
                'sku' => $variant->sku,
                'optionValueIds' => $variant->optionValues->pluck('id')->values()->all(),
                'unitPrice' => $variant->unitPrice(),
                'stock' => [
                    'available' => $variant->inventory?->availableQuantity() ?? 0,
                    'inStock' => $variant->inventory?->isInStock() ?? false,
                ],
            ]),
            'attributes' => $this->whenLoaded('attributes', fn () => $this->attributes
                ->groupBy(fn ($attr) => $attr->group->value)
                ->map(fn ($group) => $group->map(fn ($attr) => [
                    'key' => $attr->key,
                    'label' => $attr->label,
                    'value' => $attr->value,
                    'optionValueId' => $attr->option_value_id,
                ])->values())),
            'contentSections' => $this->whenLoaded('contentSections', fn () => $this->contentSections->map(fn ($section) => [
                'id' => $section->id,
                'title' => $section->title,
                'content' => $section->content,
                'contentHtml' => $section->content_html,
                'images' => $section->relationLoaded('images')
                    ? ContentSectionImageResource::collection($section->images)->resolve()
                    : [],
            ])),
            'sustainability' => $this->when(
                $this->relationLoaded('sustainabilityMaterials'),
                fn () => [
                    'weightedRecycledPercent' => $calculator->weightedRecycledPercent($this->sustainabilityMaterials),
                    'materials' => $this->sustainabilityMaterials->map(fn ($material) => [
                        'componentName' => $material->component_name,
                        'materialType' => $material->material_type,
                        'componentWeightG' => $material->component_weight_g,
                        'recycledContentPct' => $material->recycled_content_pct,
                    ]),
                ],
            ),
            'customizationOptions' => $this->is_customizable
                ? $this->customizationOptions->map(fn ($option) => [
                    'componentName' => $option->component_name,
                    'allowedMaterials' => $option->allowed_materials,
                    'allowedColors' => $option->allowed_colors,
                ])
                : [],
        ];
    }
}
