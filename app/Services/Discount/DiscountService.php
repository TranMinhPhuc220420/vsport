<?php

namespace App\Services\Discount;

use App\Enums\DiscountType;
use App\Exceptions\InvalidDiscountCodeException;
use App\Models\DiscountCode;
use App\Models\Order;
use Illuminate\Support\Str;

class DiscountService
{
    public function findByCode(string $code): ?DiscountCode
    {
        return DiscountCode::query()
            ->where('code', Str::upper(trim($code)))
            ->first();
    }

    public function validate(string $code, float $subtotal): DiscountCode
    {
        $discount = $this->findByCode($code);

        if ($discount === null) {
            throw new InvalidDiscountCodeException('Discount code is invalid.');
        }

        if (! $discount->is_active) {
            throw new InvalidDiscountCodeException('Discount code is not active.');
        }

        if ($discount->starts_at !== null && $discount->starts_at->isFuture()) {
            throw new InvalidDiscountCodeException('Discount code is not yet active.');
        }

        if ($discount->expires_at !== null && $discount->expires_at->isPast()) {
            throw new InvalidDiscountCodeException('Discount code has expired.');
        }

        if ($discount->max_uses !== null && $discount->used_count >= $discount->max_uses) {
            throw new InvalidDiscountCodeException('Discount code has reached its usage limit.');
        }

        if ($subtotal < (float) $discount->min_order_amount) {
            throw new InvalidDiscountCodeException('Order subtotal does not meet the minimum for this code.');
        }

        return $discount;
    }

    public function calculateAmount(DiscountCode $discount, float $subtotal): float
    {
        $amount = match ($discount->type) {
            DiscountType::Percent => $subtotal * ((float) $discount->value / 100),
            DiscountType::Fixed => (float) $discount->value,
        };

        return min($subtotal, round($amount, 2));
    }

    public function applyToOrder(Order $order, DiscountCode $discount, float $discountAmount): void
    {
        $order->update([
            'discount_code_id' => $discount->id,
            'discount_amount' => $discountAmount,
            'total_amount' => max(0, (float) $order->total_amount - $discountAmount),
        ]);

        $discount->increment('used_count');
    }
}
