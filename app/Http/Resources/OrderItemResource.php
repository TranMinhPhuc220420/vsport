<?php

namespace App\Http\Resources;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin OrderItem
 */
class OrderItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $options = $this->options_snapshot ?? [];

        return [
            'id' => $this->id,
            'variantId' => $this->variant_id,
            'productName' => $this->product_name,
            'options' => $options,
            'colorName' => $options[0]['value'] ?? $this->color_name,
            'size' => $options[1]['value'] ?? $this->size_val,
            'quantity' => $this->quantity,
            'unitPrice' => (float) $this->unit_price,
            'lineTotal' => (float) $this->unit_price * $this->quantity,
        ];
    }
}
