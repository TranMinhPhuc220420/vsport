<?php

namespace App\Http\Resources;

use App\Models\ReturnRequestItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ReturnRequestItem
 */
class ReturnRequestItemResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderItemId' => $this->order_item_id,
            'quantity' => $this->quantity,
            'condition' => $this->condition,
            'orderItem' => $this->whenLoaded(
                'orderItem',
                fn () => OrderItemResource::make($this->orderItem)->resolve(),
            ),
        ];
    }
}
