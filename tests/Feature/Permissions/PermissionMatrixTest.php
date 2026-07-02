<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('guest can checkout but cannot view order history', function () {
    $this->get(route('checkout.create'))->assertOk();
    $this->get(route('orders.index'))->assertRedirect(route('login'));
});

test('customer cannot access admin routes', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('admin.products.index'))->assertForbidden();
    $this->post(route('admin.products.store'), [])->assertForbidden();
});

test('customer cannot update order status', function () {
    $owner = User::factory()->create();
    $customer = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $owner, $variant);
    $this->actingAs($owner)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $this->actingAs($customer)
        ->patch(route('admin.orders.status.update', $order->order_number), [
            'status' => OrderStatus::Confirmed->value,
        ])
        ->assertForbidden();
});

test('customer cannot view another users order', function () {
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

test('admin can update order status and manage products', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $customer, $variant);
    $this->actingAs($customer)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.orders.status.update', $order->order_number), [
            'status' => OrderStatus::Confirmed->value,
        ])
        ->assertRedirect();

    $this->actingAs($admin)
        ->get(route('admin.products.index'))
        ->assertOk();
});
