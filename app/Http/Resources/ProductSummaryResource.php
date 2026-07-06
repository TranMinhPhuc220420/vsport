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

        $swatchOption = $this->options->first(fn ($option) => $option->drives_gallery)
            ?? $this->options->first(fn ($option) => $option->display_type->value === 'swatch');

        if ($swatchOption !== null) {
            foreach ($swatchOption->values as $value) {
                $colorwaySwatches[] = $value->swatch_hex ?? ColorSwatch::fromColorName($value->value);

                $image = $value->images->firstWhere('is_primary', true)
                    ?? $value->images->first();

                if ($image && $primaryImage === null) {
                    $primaryImage = ProductImageResource::make($image);
                }
            }
        }

        $defaultVariant = null;

        foreach ($this->variants as $variant) {
            $prices[] = $variant->unitPrice();

            if ($variant->inventory?->isInStock()) {
                $inStock = true;

                if ($defaultVariant === null) {
                    $defaultVariant = $variant;
                }
            }
        }

        $defaultVariant ??= $this->variants->first();

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
            'brandName' => $this->whenLoaded('brand', fn () => $this->brand?->name),
            'basePrice' => $basePrice,
            'listPrice' => $basePrice,
            'salePrice' => $onSale ? $minPrice : null,
            'primaryImage' => $primaryImage?->resolve(),
            'minPrice' => $minPrice,
            'maxPrice' => $prices !== [] ? max($prices) : $basePrice,
            'inStock' => $inStock,
            'colorwaySwatches' => $colorwaySwatches,
            'defaultVariantId' => $defaultVariant?->id,
            'defaultVariantPrice' => $defaultVariant !== null
                ? $defaultVariant->unitPrice()
                : null,
        ];
    }
}
