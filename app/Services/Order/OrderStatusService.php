<?php

namespace App\Services\Order;

use App\Enums\OrderStatus;
use App\Exceptions\InvalidOrderTransitionException;
use App\Exceptions\OrderConfirmStockException;
use App\Models\Inventory;
use App\Models\Order;
use App\Services\Payment\StripeRefundService;
use Illuminate\Support\Facades\DB;

class OrderStatusService
{
    public function __construct(
        private readonly OrderNotificationService $notifications,
        private readonly StripeRefundService $refunds,
    ) {}

    /**
     * @var array<string, list<OrderStatus>>
     */
    private const TRANSITIONS = [
        'pending' => [OrderStatus::Confirmed, OrderStatus::Cancelled],
        'confirmed' => [OrderStatus::Shipping, OrderStatus::Cancelled],
        'shipping' => [OrderStatus::Delivered, OrderStatus::Cancelled],
        'delivered' => [OrderStatus::Completed, OrderStatus::Cancelled],
        'completed' => [],
        'cancelled' => [],
    ];

    /**
     * @return list<string>
     */
    public function allowedNextStatuses(Order $order): array
    {
        $current = $order->status->value;

        return array_map(
            fn (OrderStatus $status) => $status->value,
            self::TRANSITIONS[$current] ?? [],
        );
    }

    public function transition(Order $order, OrderStatus $newStatus): Order
    {
        return DB::transaction(function () use ($order, $newStatus): Order {
            $order->loadMissing(['items.variant.inventory']);

            $current = $order->status;
            $allowed = self::TRANSITIONS[$current->value] ?? [];

            if (! in_array($newStatus, $allowed, true)) {
                throw new InvalidOrderTransitionException($current->value, $newStatus->value);
            }

            $previousStatus = $current;

            if ($current === OrderStatus::Pending && $newStatus === OrderStatus::Confirmed) {
                $this->deductStockForOrder($order);
            }

            if ($current === OrderStatus::Pending && $newStatus === OrderStatus::Cancelled) {
                $this->releaseReservationForOrder($order);
            }

            if ($newStatus === OrderStatus::Cancelled && $this->shouldRestoreStock($current)) {
                $this->restoreStockForOrder($order);
                $this->refunds->refundOrder($order);
            }

            $order->update(['status' => $newStatus]);

            $order = $order->fresh(['items', 'user']);

            $this->notifications->sendStatusUpdate($order, $previousStatus);

            return $order;
        });
    }

    private function shouldRestoreStock(OrderStatus $previousStatus): bool
    {
        return in_array($previousStatus, [
            OrderStatus::Confirmed,
            OrderStatus::Shipping,
            OrderStatus::Delivered,
        ], true);
    }

    private function deductStockForOrder(Order $order): void
    {
        foreach ($order->items as $item) {
            $variant = $item->variant;

            if ($variant === null || $variant->inventory === null) {
                throw new OrderConfirmStockException("Variant for {$item->product_name} is unavailable.");
            }

            if ($item->quantity > $variant->inventory->quantity) {
                throw new OrderConfirmStockException(
                    ($item->options_snapshot[0]['value'] ?? $item->size_val)." for {$item->product_name} has insufficient stock.",
                );
            }
        }

        foreach ($order->items as $item) {
            $inventory = Inventory::query()
                ->where('variant_id', $item->variant_id)
                ->lockForUpdate()
                ->first();

            if ($inventory === null) {
                throw new OrderConfirmStockException("Inventory record missing for variant {$item->variant_id}.");
            }

            $inventory->decrement('quantity', $item->quantity);
            $inventory->update([
                'reserved_quantity' => max(0, $inventory->reserved_quantity - $item->quantity),
            ]);
        }
    }

    private function releaseReservationForOrder(Order $order): void
    {
        foreach ($order->items as $item) {
            $inventory = Inventory::query()
                ->where('variant_id', $item->variant_id)
                ->lockForUpdate()
                ->first();

            if ($inventory !== null) {
                $inventory->update([
                    'reserved_quantity' => max(0, $inventory->reserved_quantity - $item->quantity),
                ]);
            }
        }
    }

    private function restoreStockForOrder(Order $order): void
    {
        foreach ($order->items as $item) {
            $inventory = Inventory::query()
                ->where('variant_id', $item->variant_id)
                ->lockForUpdate()
                ->first();

            if ($inventory !== null) {
                $inventory->increment('quantity', $item->quantity);
            }
        }
    }
}
