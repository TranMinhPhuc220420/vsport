<?php

use App\Enums\DiscountType;
use App\Exceptions\InvalidDiscountCodeException;
use App\Models\DiscountCode;
use App\Models\Order;
use App\Models\User;
use App\Services\Discount\DiscountService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(DiscountService::class);
});

test('findByCode normalizes code to uppercase', function () {
    DiscountCode::query()->create([
        'code' => 'SAVE10',
        'type' => DiscountType::Percent,
        'value' => 10,
        'min_order_amount' => 0,
        'is_active' => true,
    ]);

    expect($this->service->findByCode('  save10 '))->not->toBeNull()
        ->and($this->service->findByCode('save10')->code)->toBe('SAVE10');
});

test('validate rejects unknown discount code', function () {
    $this->service->validate('MISSING', 100.0);
})->throws(InvalidDiscountCodeException::class, 'Discount code is invalid.');

test('validate rejects inactive discount code', function () {
    DiscountCode::query()->create([
        'code' => 'INACTIVE',
        'type' => DiscountType::Percent,
        'value' => 10,
        'min_order_amount' => 0,
        'is_active' => false,
    ]);

    $this->service->validate('INACTIVE', 100.0);
})->throws(InvalidDiscountCodeException::class, 'Discount code is not active.');

test('validate rejects discount code that has not started yet', function () {
    DiscountCode::query()->create([
        'code' => 'FUTURE',
        'type' => DiscountType::Percent,
        'value' => 10,
        'min_order_amount' => 0,
        'is_active' => true,
        'starts_at' => Carbon::now()->addDay(),
    ]);

    $this->service->validate('FUTURE', 100.0);
})->throws(InvalidDiscountCodeException::class, 'Discount code is not yet active.');

test('validate rejects expired discount code', function () {
    DiscountCode::query()->create([
        'code' => 'EXPIRED',
        'type' => DiscountType::Percent,
        'value' => 10,
        'min_order_amount' => 0,
        'is_active' => true,
        'expires_at' => Carbon::now()->subDay(),
    ]);

    $this->service->validate('EXPIRED', 100.0);
})->throws(InvalidDiscountCodeException::class, 'Discount code has expired.');

test('validate rejects discount code at usage limit', function () {
    DiscountCode::query()->create([
        'code' => 'MAXED',
        'type' => DiscountType::Percent,
        'value' => 10,
        'min_order_amount' => 0,
        'is_active' => true,
        'max_uses' => 5,
        'used_count' => 5,
    ]);

    $this->service->validate('MAXED', 100.0);
})->throws(InvalidDiscountCodeException::class, 'Discount code has reached its usage limit.');

test('validate rejects subtotal below minimum order amount', function () {
    DiscountCode::query()->create([
        'code' => 'MIN100',
        'type' => DiscountType::Percent,
        'value' => 10,
        'min_order_amount' => 100,
        'is_active' => true,
    ]);

    $this->service->validate('MIN100', 50.0);
})->throws(InvalidDiscountCodeException::class, 'Order subtotal does not meet the minimum for this code.');

test('calculateAmount applies percent discount', function () {
    $discount = new DiscountCode([
        'type' => DiscountType::Percent,
        'value' => 20,
    ]);

    expect($this->service->calculateAmount($discount, 150.0))->toBe(30.0);
});

test('calculateAmount applies fixed discount capped at subtotal', function () {
    $discount = new DiscountCode([
        'type' => DiscountType::Fixed,
        'value' => 200,
    ]);

    expect($this->service->calculateAmount($discount, 150.0))->toBe(150.0);
});

test('applyToOrder updates order totals and increments usage count', function () {
    $user = User::factory()->create();
    $discount = DiscountCode::query()->create([
        'code' => 'SAVE10',
        'type' => DiscountType::Fixed,
        'value' => 25,
        'min_order_amount' => 0,
        'is_active' => true,
        'used_count' => 0,
    ]);
    $order = Order::factory()->create([
        'user_id' => $user->id,
        'total_amount' => 100,
    ]);

    $this->service->applyToOrder($order, $discount, 25.0);

    $order->refresh();
    $discount->refresh();

    expect($order->discount_code_id)->toBe($discount->id)
        ->and((float) $order->discount_amount)->toBe(25.0)
        ->and((float) $order->total_amount)->toBe(75.0)
        ->and($discount->used_count)->toBe(1);
});
