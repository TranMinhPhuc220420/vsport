<?php

namespace App\Http\Resources;

use App\Models\ReturnRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ReturnRequest
 */
class ReturnRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'reason' => $this->reason,
            'adminNotes' => $this->admin_notes,
            'requestedAt' => $this->requested_at?->toIso8601String(),
            'resolvedAt' => $this->resolved_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'order' => $this->whenLoaded(
                'order',
                fn () => OrderResource::make($this->order)->resolve(),
            ),
            'orderNumber' => $this->when(
                $this->relationLoaded('order'),
                fn () => $this->order->order_number,
            ),
            'customer' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            'items' => $this->whenLoaded(
                'items',
                fn () => array_values(
                    ReturnRequestItemResource::collection($this->items)->resolve(),
                ),
            ),
        ];
    }
}
