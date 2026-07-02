<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('admin can advance order through full lifecycle', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $customer, $variant);
    $this->actingAs($customer)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();
    expect($order->status)->toBe(OrderStatus::Pending);

    $transitions = [
        OrderStatus::Confirmed,
        OrderStatus::Shipping,
        OrderStatus::Delivered,
        OrderStatus::Completed,
    ];

    foreach ($transitions as $status) {
        $this->actingAs($admin)
            ->patch(route('admin.orders.status.update', $order->order_number), [
                'status' => $status->value,
            ])
            ->assertRedirect(route('admin.orders.show', $order->order_number));

        expect($order->fresh()->status)->toBe($status);
    }
});
