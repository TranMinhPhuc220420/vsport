<?php

namespace App\Services\Cart;

use App\Exceptions\CheckoutStockException;
use App\Models\Inventory;
use App\Models\ProductVariant;

class InventoryReservationService
{
    public function reserveDelta(ProductVariant $variant, int $delta): void
    {
        if ($delta === 0) {
            return;
        }

        $inventory = Inventory::query()
            ->where('variant_id', $variant->id)
            ->lockForUpdate()
            ->first();

        if ($inventory === null) {
            throw new CheckoutStockException([0 => "{$variant->displayLabel()} is unavailable."]);
        }

        if ($delta > 0 && $delta > $inventory->availableQuantity()) {
            throw new CheckoutStockException([0 => "{$variant->displayLabel()} is out of stock."]);
        }

        if ($delta < 0 && $inventory->reserved_quantity < abs($delta)) {
            $inventory->update(['reserved_quantity' => 0]);

            return;
        }

        $inventory->increment('reserved_quantity', $delta);
    }

    public function release(int $variantId, int $quantity): void
    {
        if ($quantity <= 0) {
            return;
        }

        $inventory = Inventory::query()
            ->where('variant_id', $variantId)
            ->lockForUpdate()
            ->first();

        if ($inventory === null) {
            return;
        }

        $next = max(0, $inventory->reserved_quantity - $quantity);
        $inventory->update(['reserved_quantity' => $next]);
    }
}
