<?php

use App\Enums\DiscountType;
use App\Enums\OrderStatus;
use App\Models\DiscountCode;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('checkout applies valid percent discount code', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    DiscountCode::query()->create([
        'code' => 'SAVE10',
        'type' => DiscountType::Percent,
        'value' => 10,
        'min_order_amount' => 0,
        'is_active' => true,
    ]);

    addVariantToCart($this, $user, $variant);

    $this->actingAs($user)->post(route('checkout.store'), [
        ...checkoutShippingPayload(),
        'discountCode' => 'save10',
    ])->assertRedirect();

    $order = Order::query()->firstOrFail();

    expect($order->discount_amount)->toBeGreaterThan(0)
        ->and($order->status)->toBe(OrderStatus::Pending)
        ->and((float) $order->total_amount)->toBeLessThan((float) $order->items->sum(fn ($item) => $item->unit_price * $item->quantity));
});

test('checkout rejects invalid discount code', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $user, $variant);

    $this->actingAs($user)
        ->from(route('checkout.create'))
        ->post(route('checkout.store'), [
            ...checkoutShippingPayload(),
            'discountCode' => 'NOTREAL',
        ])
        ->assertSessionHasErrors('discountCode');

    expect(Order::query()->count())->toBe(0);
});
