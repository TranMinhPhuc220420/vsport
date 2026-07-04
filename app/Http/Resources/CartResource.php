<?php

namespace App\Http\Resources;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductImage;
use App\Models\ProductOptionValue;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

/** @mixin Cart */
class CartResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'items' => $this->items->map(fn (CartItem $item) => $this->formatItem($item))->values()->all(),
            'itemCount' => (int) $this->items->sum('quantity'),
            'subtotal' => round((float) $this->items->sum(fn (CartItem $item) => $this->lineSubtotal($item)), 2),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function formatItem(CartItem $item): array
    {
        $variant = $item->variant;
        $product = $variant->product;
        $image = $this->primaryImageForVariant($variant->optionValues);
        $unitPrice = $variant->unitPrice();

        return [
            'variantId' => $variant->id,
            'productSlug' => $product->slug,
            'productId' => $product->id,
            'productName' => $product->name,
            'options' => $variant->optionValues
                ->sortBy(fn (ProductOptionValue $value) => $value->option->position)
                ->map(fn (ProductOptionValue $value) => [
                    'name' => $value->option->name,
                    'value' => $value->value,
                ])
                ->values()
                ->all(),
            'quantity' => $item->quantity,
            'unitPrice' => $unitPrice,
            'lineTotal' => round($unitPrice * $item->quantity, 2),
            'imageUrl' => $image?->image_url,
            'customConfiguration' => $item->custom_configuration,
        ];
    }

    private function lineSubtotal(CartItem $item): float
    {
        return $item->variant->unitPrice() * $item->quantity;
    }

    /**
     * @param  Collection<int, ProductOptionValue>  $optionValues
     */
    private function primaryImageForVariant($optionValues): ?ProductImage
    {
        foreach ($optionValues as $value) {
            $value->loadMissing('images');
            $image = $value->images->firstWhere('is_primary', true)
                ?? $value->images->first();

            if ($image !== null) {
                return $image;
            }
        }

        return null;
    }
}
