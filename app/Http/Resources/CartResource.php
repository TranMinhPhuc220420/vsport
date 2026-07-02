<?php

namespace App\Http\Resources;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
        $colorway = $variant->colorway;
        $product = $colorway->product;
        $image = $colorway->images->first();
        $unitPrice = (float) ($colorway->discount_price ?? $colorway->price);

        return [
            'variantId' => $variant->id,
            'productSlug' => $product->slug,
            'productId' => $product->id,
            'productName' => $product->name,
            'colorwayName' => $colorway->color_name,
            'size' => $variant->size_val,
            'quantity' => $item->quantity,
            'unitPrice' => $unitPrice,
            'lineTotal' => round($unitPrice * $item->quantity, 2),
            'imageUrl' => $image?->url,
            'customConfiguration' => $item->custom_configuration,
        ];
    }

    private function lineSubtotal(CartItem $item): float
    {
        $colorway = $item->variant->colorway;
        $unitPrice = (float) ($colorway->discount_price ?? $colorway->price);

        return $unitPrice * $item->quantity;
    }
}
