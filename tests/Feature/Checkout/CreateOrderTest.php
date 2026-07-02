<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('authenticated user can place a pending order', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $user, $variant);

    $response = $this->actingAs($user)->post(
        route('checkout.store'),
        checkoutShippingPayload(),
    );

    $order = Order::query()->first();

    $response->assertRedirect(route('orders.confirmation', $order->order_number));

    expect($order)->not->toBeNull()
        ->and($order->user_id)->toBe($user->id)
        ->and($order->status)->toBe(OrderStatus::Pending)
        ->and($order->items)->toHaveCount(1)
        ->and($order->items->first()->product_name)->not->toBeEmpty()
        ->and($order->items->first()->color_name)->not->toBeEmpty()
        ->and($order->items->first()->size_val)->not->toBeEmpty();
});
