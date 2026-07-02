<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\OrderItem
 */
class OrderItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'variantId' => $this->variant_id,
            'productName' => $this->product_name,
            'colorName' => $this->color_name,
            'size' => $this->size_val,
            'quantity' => $this->quantity,
            'unitPrice' => (float) $this->unit_price,
            'lineTotal' => (float) $this->unit_price * $this->quantity,
        ];
    }
}
