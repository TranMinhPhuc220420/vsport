<?php

use App\Enums\OrderStatus;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('admin can list and filter orders', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $customer, $variant);
    $this->actingAs($customer)->post(route('checkout.store'), checkoutShippingPayload());

    $this->actingAs($admin)
        ->get(route('admin.orders.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/orders/index')
            ->has('orders.data', 1));

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['status' => OrderStatus::Pending->value]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('orders.data', 1));

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['status' => OrderStatus::Completed->value]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('orders.data', 0));
});

test('admin can search orders by order number', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create(['name' => 'Searchable Customer']);
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $customer, $variant);
    $this->actingAs($customer)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['search' => $order->order_number]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('orders.data', 1)
            ->where('orders.data.0.orderNumber', $order->order_number));

    $this->actingAs($admin)
        ->get(route('admin.orders.index', ['search' => 'Searchable']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('orders.data', 1));
});

test('confirming a pending order deducts inventory', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();
    $inventory = Inventory::query()->where('variant_id', $variant->id)->firstOrFail();
    $startingQty = $inventory->quantity;

    addVariantToCart($this, $customer, $variant, 2);
    $this->actingAs($customer)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.orders.status.update', $order->order_number), [
            'status' => OrderStatus::Confirmed->value,
        ])
        ->assertRedirect(route('admin.orders.show', $order->order_number));

    expect($order->fresh()->status)->toBe(OrderStatus::Confirmed)
        ->and($inventory->fresh()->quantity)->toBe($startingQty - 2)
        ->and($inventory->fresh()->reserved_quantity)->toBe(0);
});

test('cancelling a confirmed order restores inventory', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();
    $inventory = Inventory::query()->where('variant_id', $variant->id)->firstOrFail();
    $startingQty = $inventory->quantity;

    addVariantToCart($this, $customer, $variant, 1);
    $this->actingAs($customer)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $this->actingAs($admin)->patch(
        route('admin.orders.status.update', $order->order_number),
        ['status' => OrderStatus::Confirmed->value],
    );

    $afterConfirm = $inventory->fresh()->quantity;

    $this->actingAs($admin)->patch(
        route('admin.orders.status.update', $order->order_number),
        ['status' => OrderStatus::Cancelled->value],
    );

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled)
        ->and($inventory->fresh()->quantity)->toBe($afterConfirm + 1)
        ->and($inventory->fresh()->quantity)->toBe($startingQty);
});

test('confirm fails when stock is insufficient', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();
    $inventory = Inventory::query()->where('variant_id', $variant->id)->firstOrFail();

    $inventory->update(['quantity' => 5, 'reserved_quantity' => 0]);

    addVariantToCart($this, $customer, $variant, 2);
    $this->actingAs($customer)->post(route('checkout.store'), checkoutShippingPayload());

    $firstOrder = Order::query()->firstOrFail();

    $secondOrder = Order::query()->create([
        'user_id' => $customer->id,
        'order_number' => 'VS-TEST0001',
        'status' => OrderStatus::Pending,
        'total_amount' => 200,
        'shipping_address' => json_encode(['name' => 'Test'], JSON_THROW_ON_ERROR),
    ]);

    $secondOrder->items()->create([
        'variant_id' => $variant->id,
        'product_name' => 'Test Shoe',
        'color_name' => 'Black',
        'size_val' => $variant->size_val,
        'quantity' => 4,
        'unit_price' => 50,
    ]);

    $this->actingAs($admin)->patch(
        route('admin.orders.status.update', $firstOrder->order_number),
        ['status' => OrderStatus::Confirmed->value],
    );

    $this->actingAs($admin)
        ->from(route('admin.orders.show', $secondOrder->order_number))
        ->patch(route('admin.orders.status.update', $secondOrder->order_number), [
            'status' => OrderStatus::Confirmed->value,
        ])
        ->assertRedirect(route('admin.orders.show', $secondOrder->order_number))
        ->assertSessionHasErrors('status');

    expect($secondOrder->fresh()->status)->toBe(OrderStatus::Pending)
        ->and($inventory->fresh()->quantity)->toBe(3);
});
