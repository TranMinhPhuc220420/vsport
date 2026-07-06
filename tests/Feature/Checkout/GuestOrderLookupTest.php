<?php

use App\Models\Order;
use App\Models\ProductVariant;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function placeGuestOrder(mixed $test): Order
{
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToGuestCart($test, $variant);

    withGuestCartCookie($test)
        ->post(route('checkout.store'), guestCheckoutPayload())
        ->assertRedirect();

    return Order::query()->firstOrFail();
}

test('guest can look up an order with matching order number and email', function () {
    $order = placeGuestOrder($this);

    // Simulate a lost session: the original checkout already granted
    // guest_order_access, so flush it and prove the lookup grants it again.
    $this->flushSession();

    $response = $this->post(route('orders.lookup.store'), [
        'orderNumber' => $order->order_number,
        'email' => 'guest@example.com',
    ]);

    $response->assertRedirect(route('orders.confirmation', $order->order_number));

    $this->get(route('orders.confirmation', $order->order_number))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/orders/confirmation')
            ->where('order.orderNumber', $order->order_number));
});

test('guest order lookup fails generically for a mismatched email', function () {
    $order = placeGuestOrder($this);
    $this->flushSession();

    $response = $this->post(route('orders.lookup.store'), [
        'orderNumber' => $order->order_number,
        'email' => 'someone-else@example.com',
    ]);

    $response->assertSessionHasErrors('orderNumber');

    $this->get(route('orders.confirmation', $order->order_number))
        ->assertForbidden();
});

test('guest order lookup fails generically for a non-existent order number', function () {
    $response = $this->post(route('orders.lookup.store'), [
        'orderNumber' => 'VS-DOESNOTEXIST',
        'email' => 'guest@example.com',
    ]);

    $response->assertSessionHasErrors('orderNumber');

    $errors = session('errors');

    expect($errors->first('orderNumber'))->toBe(__('messages.order_lookup_failed'));
});

test('guest order lookup is rate limited', function () {
    $order = placeGuestOrder($this);

    for ($i = 0; $i < 5; $i++) {
        $this->post(route('orders.lookup.store'), [
            'orderNumber' => $order->order_number,
            'email' => 'wrong@example.com',
        ]);
    }

    $this->post(route('orders.lookup.store'), [
        'orderNumber' => $order->order_number,
        'email' => 'wrong@example.com',
    ])->assertStatus(429);
});
