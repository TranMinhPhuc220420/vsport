<?php

use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('user can view order confirmation page for their order', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $user, $variant);
    $this->actingAs($user)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $response = $this->actingAs($user)->get(
        route('orders.confirmation', $order->order_number),
    );

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/orders/confirmation')
            ->where('order.orderNumber', $order->order_number)
            ->has('order.items')
        );
});

test('user cannot view another users order confirmation', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $owner, $variant);
    $this->actingAs($owner)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $this->actingAs($other)
        ->get(route('orders.confirmation', $order->order_number))
        ->assertForbidden();
});

test('guest can view order confirmation after checkout in same session', function () {
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToGuestCart($this, $variant);

    withGuestCartCookie($this)
        ->post(route('checkout.store'), guestCheckoutPayload())
        ->assertRedirect();

    $order = Order::query()->firstOrFail();

    withGuestCartCookie($this)
        ->get(route('orders.confirmation', $order->order_number))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/orders/confirmation')
            ->where('order.orderNumber', $order->order_number)
        );
});

test('guest cannot view order confirmation without session access', function () {
    $owner = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $owner, $variant);
    $this->actingAs($owner)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    auth()->logout();

    $this->get(route('orders.confirmation', $order->order_number))
        ->assertForbidden();
});
