<?php

use App\Enums\OrderStatus;
use App\Enums\ShippingCarrier;
use App\Models\Order;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

function orderWithGuestEmail(string $email): Order
{
    return Order::factory()->create([
        'status' => OrderStatus::Shipping,
        'shipping_address' => json_encode([
            'name' => 'Guest',
            'phone' => '0900000000',
            'address' => '123 Street',
            'email' => $email,
        ]),
    ]);
}

test('admin can update order tracking details', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create(['status' => OrderStatus::Shipping]);

    $this->actingAs($admin)
        ->patch(route('admin.orders.tracking.update', $order->order_number), [
            'trackingNumber' => 'GHTK123456',
            'shippingCarrier' => ShippingCarrier::Ghtk->value,
        ])
        ->assertRedirect(route('admin.orders.show', $order->order_number));

    $order->refresh();

    expect($order->tracking_number)->toBe('GHTK123456')
        ->and($order->shipping_carrier)->toBe(ShippingCarrier::Ghtk);
});

test('guest can look up tracking with order number and email', function () {
    $order = orderWithGuestEmail('guest@example.com');

    $this->post(route('orders.track.store'), [
        'orderNumber' => $order->order_number,
        'email' => 'guest@example.com',
    ])
        ->assertRedirect(route('orders.track.show', $order->order_number));

    $this->get(route('orders.track.show', $order->order_number))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/orders/track-show')
            ->where('order.orderNumber', $order->order_number)
        );
});

test('tracking lookup fails with wrong email', function () {
    $order = orderWithGuestEmail('guest@example.com');

    $this->post(route('orders.track.store'), [
        'orderNumber' => $order->order_number,
        'email' => 'wrong@example.com',
    ])
        ->assertSessionHasErrors('orderNumber');
});

test('tracking page shows tracking number when set', function () {
    $user = User::factory()->create();
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'status' => OrderStatus::Shipping,
        'tracking_number' => 'GHN987654',
        'shipping_carrier' => ShippingCarrier::Ghn,
    ]);

    $this->actingAs($user)
        ->get(route('orders.track.show', $order->order_number))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('order.trackingNumber', 'GHN987654')
            ->where('order.shippingCarrier', ShippingCarrier::Ghn->value)
            ->where('order.trackingUrl', fn ($url) => is_string($url) && str_contains($url, 'GHN987654'))
        );
});

test('admin can bulk update order status for eligible orders', function () {
    $admin = User::factory()->admin()->create();
    $orders = Order::factory()->count(2)->create([
        'status' => OrderStatus::Pending,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.orders.status.bulk-update'), [
            'ids' => $orders->pluck('id')->all(),
            'status' => OrderStatus::Confirmed->value,
        ])
        ->assertRedirect(route('admin.orders.index'));

    foreach ($orders as $order) {
        expect($order->fresh()->status)->toBe(OrderStatus::Confirmed);
    }
});

test('bulk status update skips ineligible orders and reports partial success', function () {
    $admin = User::factory()->admin()->create();
    $eligible = Order::factory()->create(['status' => OrderStatus::Pending]);
    $ineligible = Order::factory()->create(['status' => OrderStatus::Completed]);

    $this->actingAs($admin)
        ->patch(route('admin.orders.status.bulk-update'), [
            'ids' => [$eligible->id, $ineligible->id],
            'status' => OrderStatus::Confirmed->value,
        ])
        ->assertRedirect(route('admin.orders.index'));

    expect($eligible->fresh()->status)->toBe(OrderStatus::Confirmed)
        ->and($ineligible->fresh()->status)->toBe(OrderStatus::Completed);
});
