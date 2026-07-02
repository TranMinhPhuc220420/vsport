<?php

use App\Enums\OrderStatus;
use App\Models\Cart;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('adding to cart reserves inventory', function () {
    $variant = ProductVariant::query()->firstOrFail();
    $inventory = Inventory::query()->where('variant_id', $variant->id)->firstOrFail();

    $this->postJson('/api/cart/items', [
        'variantId' => $variant->id,
        'quantity' => 2,
    ])->assertOk();

    expect($inventory->fresh()->reserved_quantity)->toBe(2);
});

test('removing cart item releases reservation', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();
    $inventory = Inventory::query()->where('variant_id', $variant->id)->firstOrFail();

    addVariantToCart($this, $user, $variant, 2);

    $this->actingAs($user)
        ->deleteJson("/api/cart/items/{$variant->id}")
        ->assertOk();

    expect($inventory->fresh()->reserved_quantity)->toBe(0);
});

test('guest cart merges into user cart on login', function () {
    $variant = ProductVariant::query()->firstOrFail();
    $user = User::factory()->create();

    $this->postJson('/api/cart/items', [
        'variantId' => $variant->id,
        'quantity' => 1,
    ])->assertOk();

    $sessionId = Cart::query()->value('session_id');
    expect($sessionId)->not->toBeEmpty();

    $this->withUnencryptedCookie('cart_session_id', $sessionId)
        ->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ])
        ->assertRedirect();

    $userCart = Cart::query()->where('user_id', $user->id)->with('items')->first();
    expect($userCart)->not->toBeNull()
        ->and($userCart->items)->toHaveCount(1)
        ->and($userCart->items->first()->quantity)->toBe(1);
});

test('expired carts release reservations', function () {
    $variant = ProductVariant::query()->firstOrFail();
    $inventory = Inventory::query()->where('variant_id', $variant->id)->firstOrFail();

    $this->postJson('/api/cart/items', [
        'variantId' => $variant->id,
        'quantity' => 3,
    ])->assertOk();

    Cart::query()->update(['expires_at' => Carbon::now()->subMinute()]);

    $this->artisan('carts:release-expired')->assertSuccessful();

    expect($inventory->fresh()->reserved_quantity)->toBe(0)
        ->and(Cart::query()->count())->toBe(0);
});

test('checkout uses server cart and keeps reservation until confirm', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();
    $inventory = Inventory::query()->where('variant_id', $variant->id)->firstOrFail();

    $startingQty = $inventory->quantity;

    addVariantToCart($this, $user, $variant, 2);

    $this->actingAs($user)->post(route('checkout.store'), checkoutShippingPayload())
        ->assertRedirect();

    $order = Order::query()->firstOrFail();

    expect($order->status)->toBe(OrderStatus::Pending)
        ->and($order->items)->toHaveCount(1)
        ->and($inventory->fresh()->reserved_quantity)->toBe(2)
        ->and(Cart::query()->where('user_id', $user->id)->first()?->items)->toBeEmpty();

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin)->patch(route('admin.orders.status.update', $order->order_number), [
        'status' => OrderStatus::Confirmed->value,
    ])->assertRedirect();

    expect($inventory->fresh()->quantity)->toBe($startingQty - 2)
        ->and($inventory->fresh()->reserved_quantity)->toBe(0);
});

test('cancelling pending order releases reservation', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();
    $inventory = Inventory::query()->where('variant_id', $variant->id)->firstOrFail();
    $startingQty = $inventory->quantity;

    addVariantToCart($this, $user, $variant, 1);
    $this->actingAs($user)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $this->actingAs($admin)->patch(route('admin.orders.status.update', $order->order_number), [
        'status' => OrderStatus::Cancelled->value,
    ])->assertRedirect();

    expect($inventory->fresh()->quantity)->toBe($startingQty)
        ->and($inventory->fresh()->reserved_quantity)->toBe(0);
});
