<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Support\ColorSwatch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Product
 */
class ProductSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $prices = [];
        $inStock = false;
        $primaryImage = null;
        $colorwaySwatches = [];

        foreach ($this->activeColorways as $colorway) {
            $prices[] = $colorway->effectivePrice();
            $colorwaySwatches[] = ColorSwatch::fromColorName($colorway->color_name);

            foreach ($colorway->variants as $variant) {
                $prices[] = $variant->unitPrice();

                if ($variant->inventory?->isInStock()) {
                    $inStock = true;
                }
            }

            $image = $colorway->images->firstWhere('is_primary', true)
                ?? $colorway->images->first();

            if ($image && $primaryImage === null) {
                $primaryImage = ProductImageResource::make($image);
            }
        }

        $basePrice = (float) $this->base_price;
        $minPrice = $prices !== [] ? min($prices) : $basePrice;
        $onSale = $minPrice < $basePrice;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'subTitle' => $this->sub_title,
            'gender' => $this->gender->value,
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'basePrice' => $basePrice,
            'listPrice' => $basePrice,
            'salePrice' => $onSale ? $minPrice : null,
            'primaryImage' => $primaryImage,
            'minPrice' => $minPrice,
            'maxPrice' => $prices !== [] ? max($prices) : $basePrice,
            'inStock' => $inStock,
            'colorwaySwatches' => $colorwaySwatches,
        ];
    }
}
