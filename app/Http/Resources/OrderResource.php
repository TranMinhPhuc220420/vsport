<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $shipping = json_decode($this->shipping_address, true);

        return [
            'id' => $this->id,
            'orderNumber' => $this->order_number,
            'status' => $this->status->value,
            'totalAmount' => (float) $this->total_amount,
            'shippingAddress' => is_array($shipping) ? [
                'name' => $shipping['name'] ?? '',
                'phone' => $shipping['phone'] ?? '',
                'address' => $shipping['address'] ?? '',
            ] : [
                'name' => '',
                'phone' => '',
                'address' => (string) $this->shipping_address,
            ],
            'createdAt' => $this->created_at?->toIso8601String(),
            'customer' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            'items' => $this->whenLoaded(
                'items',
                fn () => array_values(
                    OrderItemResource::collection($this->items)->resolve(),
                ),
            ),
            'paymentMethod' => $this->payment_method->value,
            'paymentIntentId' => $this->payment_intent_id,
            'discountAmount' => (float) $this->discount_amount,
            'discountCode' => $this->whenLoaded(
                'discountCode',
                fn () => $this->discountCode?->code,
            ),
            'subtotalAmount' => round((float) $this->total_amount + (float) $this->discount_amount, 2),
        ];
    }
}
