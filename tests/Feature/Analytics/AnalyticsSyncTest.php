<?php

use App\Enums\OrderStatus;
use App\Models\Analytics\FactSale;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('analytics sync populates fact rows from completed orders', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $user, $variant);
    $this->actingAs($user)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    foreach ([
        OrderStatus::Confirmed,
        OrderStatus::Shipping,
        OrderStatus::Delivered,
        OrderStatus::Completed,
    ] as $status) {
        $this->actingAs($admin)->patch(route('admin.orders.status.update', $order->order_number), [
            'status' => $status->value,
        ]);
    }

    $this->artisan('analytics:sync')->assertSuccessful();

    expect(FactSale::query()->count())->toBe(1);
});
