<?php

use App\Enums\PaymentMethod;
use App\Enums\RefundStatus;
use App\Models\Order;
use App\Services\Payment\StripeRefundService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    config(['services.stripe.secret' => 'sk_test_fake']);
    $this->service = new StripeRefundService;
});

test('does not attempt a refund for cod orders', function () {
    $order = Order::factory()->create([
        'payment_method' => PaymentMethod::Cod,
        'payment_intent_id' => null,
    ]);

    $this->service->refundOrder($order);

    expect($order->fresh()->refund_id)->toBeNull()
        ->and($order->fresh()->refund_status)->toBeNull();
});

test('does not attempt a refund without a payment intent id', function () {
    $order = Order::factory()->create([
        'payment_method' => PaymentMethod::Stripe,
        'payment_intent_id' => null,
    ]);

    $this->service->refundOrder($order);

    expect($order->fresh()->refund_id)->toBeNull()
        ->and($order->fresh()->refund_status)->toBeNull();
});

test('is idempotent once a refund has already been recorded', function () {
    $order = Order::factory()->create([
        'payment_method' => PaymentMethod::Stripe,
        'payment_intent_id' => 'pi_test_already_refunded',
        'refund_id' => 're_existing',
        'refund_status' => RefundStatus::Refunded,
        'refunded_at' => now(),
    ]);

    $this->service->refundOrder($order);

    expect($order->fresh()->refund_id)->toBe('re_existing');
});
