<?php

use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('checkout rejects missing customer phone', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();
    addVariantToCart($this, $user, $variant);

    $response = $this->actingAs($user)->from(route('checkout.create'))->post(route('checkout.store'), [
        'customerName' => 'Test Customer',
        'customerPhone' => '',
        'shippingAddress' => '123 Nguyen Hue',
    ]);

    $response->assertSessionHasErrors('customerPhone');
    expect(Order::query()->count())->toBe(0);
});

test('checkout rejects empty shipping address', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();
    addVariantToCart($this, $user, $variant);

    $response = $this->actingAs($user)->from(route('checkout.create'))->post(route('checkout.store'), [
        'customerName' => 'Test Customer',
        'customerPhone' => '+84901234567',
        'shippingAddress' => '',
    ]);

    $response->assertSessionHasErrors('shippingAddress');
    expect(Order::query()->count())->toBe(0);
});

test('checkout rejects empty server cart', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->from(route('checkout.create'))->post(route('checkout.store'), checkoutShippingPayload());

    $response->assertSessionHasErrors('items.0.variantId');
    expect(Order::query()->count())->toBe(0);
});
