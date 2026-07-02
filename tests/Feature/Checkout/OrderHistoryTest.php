<?php

use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('user can view their own order history', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $user, $variant);
    $this->actingAs($user)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $response = $this->actingAs($user)->get(route('orders.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/orders/index')
            ->has('orders.data', 1)
            ->where('orders.data.0.orderNumber', $order->order_number)
        );
});

test('user cannot view another users order', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $owner, $variant);
    $this->actingAs($owner)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $this->actingAs($other)
        ->get(route('orders.show', $order->order_number))
        ->assertForbidden();
});
