<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\ShippingAddress;
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

test('checkout with saveAddress creates a saved address for the user', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $user, $variant);

    $this->actingAs($user)->post(route('checkout.store'), [
        ...checkoutShippingPayload(),
        'saveAddress' => true,
    ]);

    $address = ShippingAddress::query()->where('user_id', $user->id)->firstOrFail();

    expect($address->recipient_name)->toBe('Test Customer')
        ->and($address->phone)->toBe('+84901234567')
        ->and($address->is_default)->toBeTrue();
});

test('checkout order keeps its shipping snapshot even if the saved address later changes', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $user, $variant);

    $this->actingAs($user)->post(route('checkout.store'), [
        ...checkoutShippingPayload(),
        'saveAddress' => true,
    ]);

    $order = Order::query()->firstOrFail();
    $address = ShippingAddress::query()->where('user_id', $user->id)->firstOrFail();

    $address->update(['address_line' => 'A brand new address, edited later']);

    $shipping = json_decode($order->fresh()->shipping_address, true);

    expect($shipping['address'])->toBe('123 Nguyen Hue, District 1, Ho Chi Minh City')
        ->and($shipping['address'])->not->toBe($address->fresh()->address_line);
});

test('checkout without saveAddress does not create a saved address', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $user, $variant);

    $this->actingAs($user)->post(route('checkout.store'), checkoutShippingPayload());

    expect(ShippingAddress::query()->where('user_id', $user->id)->count())->toBe(0);
});
