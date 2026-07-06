<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\RefundStatus;
use App\Models\Order;
use App\Models\User;
use App\Services\Payment\StripeRefundService;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('cancelling a confirmed order attempts a refund', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create([
        'status' => OrderStatus::Confirmed,
        'payment_method' => PaymentMethod::Stripe,
        'payment_intent_id' => 'pi_test_confirmed',
    ]);

    $this->mock(StripeRefundService::class, function ($mock) use ($order): void {
        $mock->shouldReceive('refundOrder')
            ->once()
            ->withArgs(fn (Order $arg) => $arg->id === $order->id);
    });

    $this->actingAs($admin)
        ->patch(route('admin.orders.status.update', $order->order_number), [
            'status' => OrderStatus::Cancelled->value,
        ])
        ->assertRedirect(route('admin.orders.show', $order->order_number));
});

test('cancelling a pending order never attempts a refund', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create([
        'status' => OrderStatus::Pending,
        'payment_method' => PaymentMethod::Cod,
    ]);

    $this->mock(StripeRefundService::class, function ($mock): void {
        $mock->shouldNotReceive('refundOrder');
    });

    $this->actingAs($admin)
        ->patch(route('admin.orders.status.update', $order->order_number), [
            'status' => OrderStatus::Cancelled->value,
        ])
        ->assertRedirect(route('admin.orders.show', $order->order_number));
});

test('admin can retry a failed refund', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create([
        'status' => OrderStatus::Cancelled,
        'payment_method' => PaymentMethod::Stripe,
        'payment_intent_id' => 'pi_test_retry',
        'refund_status' => RefundStatus::Failed,
    ]);

    $this->mock(StripeRefundService::class, function ($mock) use ($order): void {
        $mock->shouldReceive('refundOrder')
            ->once()
            ->withArgs(fn (Order $arg) => $arg->id === $order->id)
            ->andReturnUsing(function (Order $arg): void {
                $arg->update([
                    'refund_id' => 're_retry_success',
                    'refund_status' => RefundStatus::Refunded,
                    'refunded_at' => now(),
                ]);
            });
    });

    $this->actingAs($admin)
        ->patch(route('admin.orders.refund.retry', $order->order_number))
        ->assertRedirect(route('admin.orders.show', $order->order_number));

    expect($order->fresh()->refund_status)->toBe(RefundStatus::Refunded);
});

test('retry is rejected for an order that is not an eligible failed refund', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create([
        'status' => OrderStatus::Pending,
        'payment_method' => PaymentMethod::Stripe,
        'payment_intent_id' => 'pi_test_not_eligible',
    ]);

    $this->mock(StripeRefundService::class, function ($mock): void {
        $mock->shouldNotReceive('refundOrder');
    });

    $this->actingAs($admin)
        ->patch(route('admin.orders.refund.retry', $order->order_number))
        ->assertSessionHasErrors('refund');
});

test('customer cannot retry a refund', function () {
    $customer = User::factory()->create();
    $order = Order::factory()->create([
        'status' => OrderStatus::Cancelled,
        'payment_method' => PaymentMethod::Stripe,
        'refund_status' => RefundStatus::Failed,
    ]);

    $this->actingAs($customer)
        ->patch(route('admin.orders.refund.retry', $order->order_number))
        ->assertForbidden();
});
