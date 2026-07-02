<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class AdminProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'styleCode' => $this->style_code,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'categoryId' => $this->category_id,
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'subTitle' => $this->sub_title,
            'basePrice' => (float) $this->base_price,
            'gender' => $this->gender->value,
            'colorways' => $this->whenLoaded('colorways', fn () => $this->colorways->map(fn ($colorway) => [
                'id' => $colorway->id,
                'colorwayCode' => $colorway->colorway_code,
                'fullStyleCode' => $colorway->full_style_code,
                'colorName' => $colorway->color_name,
                'discountPrice' => $colorway->discount_price !== null
                    ? (float) $colorway->discount_price
                    : null,
                'isActive' => (bool) $colorway->is_active,
                'images' => ProductImageResource::collection($colorway->images)->resolve(),
                'variants' => $colorway->variants->map(fn ($variant) => [
                    'id' => $variant->id,
                    'size' => $variant->size_val,
                    'sku' => $variant->sku,
                    'quantity' => $variant->inventory?->quantity ?? 0,
                    'available' => $variant->inventory?->availableQuantity() ?? 0,
                ]),
            ])),
        ];
    }
}
