<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('custom configuration round trips from cart to order', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();
    $config = ['Upper' => ['material' => 'Leather', 'color' => '#000000']];

    $this->actingAs($user)->postJson('/api/cart/items', [
        'variantId' => $variant->id,
        'quantity' => 1,
        'customConfiguration' => $config,
    ])->assertOk();

    $this->actingAs($user)->post(route('checkout.store'), checkoutShippingPayload())
        ->assertRedirect();

    $item = OrderItem::query()->firstOrFail();

    expect($item->custom_configuration)->toBe($config);
});
