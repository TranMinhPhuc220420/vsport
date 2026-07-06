<?php

use App\Enums\OrderStatus;
use App\Exceptions\InvalidOrderTransitionException;
use App\Models\Order;
use App\Services\Order\OrderNotificationService;
use App\Services\Order\OrderStatusService;
use App\Services\Payment\StripeRefundService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->notifications = Mockery::mock(OrderNotificationService::class);
    $this->notifications->shouldReceive('sendStatusUpdate')->andReturnNull();

    $refunds = Mockery::mock(StripeRefundService::class);
    $refunds->shouldReceive('refundOrder')->andReturnNull();

    $this->service = new OrderStatusService($this->notifications, $refunds);
});

afterEach(function () {
    Mockery::close();
});

test('allowedNextStatuses returns valid transitions for pending order', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    expect($this->service->allowedNextStatuses($order))
        ->toBe(['confirmed', 'cancelled']);
});

test('allowedNextStatuses returns empty list for terminal statuses', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Completed]);

    expect($this->service->allowedNextStatuses($order))->toBe([]);
});

test('transition rejects invalid status change', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    $this->service->transition($order, OrderStatus::Shipping);
})->throws(InvalidOrderTransitionException::class);

test('transition updates order status for valid change', function () {
    $order = Order::factory()->create(['status' => OrderStatus::Pending]);

    $updated = $this->service->transition($order, OrderStatus::Cancelled);

    expect($updated->status)->toBe(OrderStatus::Cancelled);
});
