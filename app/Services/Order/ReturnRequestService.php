<?php

namespace App\Services\Order;

use App\Enums\OrderStatus;
use App\Enums\ReturnRequestStatus;
use App\Exceptions\InvalidReturnTransitionException;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\ReturnRequestItem;
use App\Models\User;
use App\Services\Admin\ReturnPolicySettingsService;
use App\Services\Payment\StripeRefundService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReturnRequestService
{
    public function __construct(
        private readonly ReturnPolicySettingsService $policy,
        private readonly ReturnRequestNotificationService $notifications,
        private readonly StripeRefundService $refunds,
    ) {}

    /**
     * @var array<string, list<ReturnRequestStatus>>
     */
    private const TRANSITIONS = [
        'pending' => [ReturnRequestStatus::Approved, ReturnRequestStatus::Rejected],
        'approved' => [ReturnRequestStatus::Received, ReturnRequestStatus::Rejected],
        'rejected' => [],
        'received' => [ReturnRequestStatus::Refunded, ReturnRequestStatus::Closed],
        'refunded' => [ReturnRequestStatus::Closed],
        'closed' => [],
    ];

    /**
     * @return array{eligible: bool, reason: string|null}
     */
    public function eligibility(Order $order): array
    {
        $settings = $this->policy->settings();

        if (! $settings['returnsEnabled']) {
            return ['eligible' => false, 'reason' => 'disabled'];
        }

        if (! in_array($order->status, [OrderStatus::Delivered, OrderStatus::Completed], true)) {
            return ['eligible' => false, 'reason' => 'status'];
        }

        $deadline = $order->created_at?->copy()->addDays($settings['returnsWindowDays']);

        if ($deadline === null || $deadline->isPast()) {
            return ['eligible' => false, 'reason' => 'window'];
        }

        $hasActiveReturn = $order->returnRequests()
            ->whereNotIn('status', [
                ReturnRequestStatus::Rejected->value,
                ReturnRequestStatus::Closed->value,
            ])
            ->exists();

        if ($hasActiveReturn) {
            return ['eligible' => false, 'reason' => 'existing'];
        }

        return ['eligible' => true, 'reason' => null];
    }

    /**
     * @param  list<array{orderItemId: int, quantity: int}>  $items
     */
    public function create(Order $order, User $user, string $reason, array $items): ReturnRequest
    {
        $eligibility = $this->eligibility($order);

        if (! $eligibility['eligible']) {
            throw ValidationException::withMessages([
                'return' => [__('messages.return_request_ineligible')],
            ]);
        }

        if ($order->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'return' => [__('messages.return_request_forbidden')],
            ]);
        }

        $order->loadMissing('items');

        return DB::transaction(function () use ($order, $user, $reason, $items): ReturnRequest {
            $returnRequest = ReturnRequest::query()->create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'status' => ReturnRequestStatus::Pending,
                'reason' => $reason,
                'requested_at' => now(),
            ]);

            foreach ($items as $item) {
                $orderItem = $order->items->firstWhere('id', $item['orderItemId']);

                if ($orderItem === null) {
                    throw ValidationException::withMessages([
                        'items' => [__('messages.return_request_invalid_item')],
                    ]);
                }

                $quantity = (int) $item['quantity'];

                if ($quantity < 1 || $quantity > $orderItem->quantity) {
                    throw ValidationException::withMessages([
                        'items' => [__('messages.return_request_invalid_quantity')],
                    ]);
                }

                ReturnRequestItem::query()->create([
                    'return_request_id' => $returnRequest->id,
                    'order_item_id' => $orderItem->id,
                    'quantity' => $quantity,
                ]);
            }

            $returnRequest = $returnRequest->fresh(['items.orderItem', 'order.user']);

            $this->notifications->sendSubmittedToAdmin($returnRequest);

            return $returnRequest;
        });
    }

    /**
     * @return list<string>
     */
    public function allowedNextStatuses(ReturnRequest $returnRequest): array
    {
        $current = $returnRequest->status->value;

        return array_map(
            fn (ReturnRequestStatus $status) => $status->value,
            self::TRANSITIONS[$current] ?? [],
        );
    }

    public function transition(
        ReturnRequest $returnRequest,
        ReturnRequestStatus $newStatus,
        ?string $adminNotes = null,
    ): ReturnRequest {
        return DB::transaction(function () use ($returnRequest, $newStatus, $adminNotes): ReturnRequest {
            $returnRequest->loadMissing(['items.orderItem.variant', 'order']);

            $current = $returnRequest->status;
            $allowed = self::TRANSITIONS[$current->value] ?? [];

            if (! in_array($newStatus, $allowed, true)) {
                throw new InvalidReturnTransitionException($current->value, $newStatus->value);
            }

            if ($newStatus === ReturnRequestStatus::Rejected && ($adminNotes === null || trim($adminNotes) === '')) {
                throw ValidationException::withMessages([
                    'adminNotes' => [__('messages.return_request_reject_notes_required')],
                ]);
            }

            $previousStatus = $current;

            if ($newStatus === ReturnRequestStatus::Received) {
                $this->restockItems($returnRequest);
            }

            if ($newStatus === ReturnRequestStatus::Refunded) {
                $this->refunds->refundOrder($returnRequest->order);
            }

            $updates = ['status' => $newStatus];

            if ($adminNotes !== null && trim($adminNotes) !== '') {
                $updates['admin_notes'] = trim($adminNotes);
            }

            if (in_array($newStatus, [
                ReturnRequestStatus::Rejected,
                ReturnRequestStatus::Closed,
            ], true)) {
                $updates['resolved_at'] = now();
            }

            $returnRequest->update($updates);

            $returnRequest = $returnRequest->fresh(['items.orderItem', 'order.user']);

            $this->notifications->sendStatusUpdateToCustomer($returnRequest, $previousStatus);

            return $returnRequest;
        });
    }

    private function restockItems(ReturnRequest $returnRequest): void
    {
        foreach ($returnRequest->items as $item) {
            $variantId = $item->orderItem?->variant_id;

            if ($variantId === null) {
                continue;
            }

            $inventory = Inventory::query()
                ->where('variant_id', $variantId)
                ->lockForUpdate()
                ->first();

            if ($inventory !== null) {
                $inventory->increment('quantity', $item->quantity);
            }
        }
    }
}
