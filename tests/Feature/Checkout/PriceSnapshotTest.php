<?php

use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('order item unit price is computed server side', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()
        ->whereHas('product', fn ($query) => $query->where('slug', 'zegama-2'))
        ->with(['product', 'inventory'])
        ->firstOrFail();

    $expectedPrice = $variant->unitPrice();

    addVariantToCart($this, $user, $variant);
    $this->actingAs($user)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->with('items')->firstOrFail();

    expect((float) $order->items->first()->unit_price)->toBe($expectedPrice);
});
