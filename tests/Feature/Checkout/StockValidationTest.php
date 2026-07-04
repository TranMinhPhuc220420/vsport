<?php

use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('cart rejects out of stock variant', function () {
    $user = User::factory()->create();

    $variant = variantForProductOption('jordan-1-low', 'US 12');

    $this->actingAs($user)->postJson('/api/cart/items', [
        'variantId' => $variant->id,
        'quantity' => 1,
    ])->assertUnprocessable();

    expect(Order::query()->count())->toBe(0);
});

test('cart rejects quantity greater than available stock', function () {
    $user = User::factory()->create();

    $variant = ProductVariant::query()
        ->with('inventory')
        ->get()
        ->first(
            fn (ProductVariant $candidate) => $candidate->inventory !== null
                && $candidate->inventory->availableQuantity() > 0
                && $candidate->inventory->availableQuantity() < 10,
        );

    if ($variant === null) {
        $this->markTestSkipped('No seeded variant with available stock under 10.');
    }

    $available = $variant->inventory->availableQuantity();

    $this->actingAs($user)->postJson('/api/cart/items', [
        'variantId' => $variant->id,
        'quantity' => $available + 1,
    ])->assertUnprocessable();

    expect(Order::query()->count())->toBe(0);
});
