<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\RefundStatus;
use App\Enums\ShippingCarrier;
use App\Exceptions\InvalidOrderTransitionException;
use App\Exceptions\OrderConfirmStockException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkUpdateOrderStatusRequest;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Requests\Admin\UpdateOrderTrackingRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Admin\AdminActivityService;
use App\Services\Admin\OrderExportService;
use App\Services\Order\OrderStatusService;
use App\Services\Payment\StripeRefundService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderStatusService $orderStatus,
        private readonly OrderExportService $export,
        private readonly AdminActivityService $activity,
        private readonly StripeRefundService $refunds,
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $search = $request->string('search')->trim()->toString();

        $orders = $this->filteredQuery($status, $search)
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => OrderResource::collection($orders),
            'filters' => [
                'status' => is_string($status) ? $status : null,
                'search' => $search !== '' ? $search : null,
            ],
            'statusOptions' => array_column(OrderStatus::cases(), 'value'),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $status = $request->query('status');
        $search = $request->string('search')->trim()->toString();

        $this->activity->log(
            $request->user(),
            'orders.export',
            properties: [
                'status' => is_string($status) ? $status : null,
                'search' => $search !== '' ? $search : null,
            ],
            request: $request,
        );

        return $this->export->streamCsv(
            $this->filteredQuery(
                is_string($status) ? $status : null,
                $search,
            ),
        );
    }

    public function show(string $orderNumber): Response
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with(['items', 'user', 'discountCode'])
            ->firstOrFail();

        $this->authorize('view', $order);

        return Inertia::render('admin/orders/show', [
            'order' => OrderResource::make($order)->resolve(),
            'allowedNextStatuses' => $this->orderStatus->allowedNextStatuses($order),
        ]);
    }

    public function updateStatus(
        UpdateOrderStatusRequest $request,
        string $orderNumber,
    ): RedirectResponse {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $this->authorize('update', $order);

        try {
            $order = $this->orderStatus->transition($order, $request->status());
        } catch (InvalidOrderTransitionException|OrderConfirmStockException $exception) {
            return back()->withErrors(['status' => $exception->getMessage()]);
        }

        $this->activity->log(
            $request->user(),
            'orders.status.update',
            $order,
            [
                'status' => $request->status()->value,
                'refund_status' => $order->refund_status?->value,
            ],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.order_status_updated'),
        ]);

        return redirect()->route('admin.orders.show', $orderNumber);
    }

    public function updateTracking(
        UpdateOrderTrackingRequest $request,
        string $orderNumber,
    ): RedirectResponse {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $this->authorize('update', $order);

        $validated = $request->validated();
        $trackingNumber = isset($validated['trackingNumber'])
            ? trim($validated['trackingNumber'])
            : null;
        $trackingNumber = $trackingNumber !== '' ? $trackingNumber : null;

        $carrier = null;

        if ($trackingNumber !== null && isset($validated['shippingCarrier'])) {
            $carrier = ShippingCarrier::from($validated['shippingCarrier']);
        }

        $order->update([
            'tracking_number' => $trackingNumber,
            'shipping_carrier' => $carrier,
        ]);

        $this->activity->log(
            $request->user(),
            'orders.tracking.update',
            $order,
            [
                'tracking_number' => $trackingNumber,
                'shipping_carrier' => $carrier?->value,
            ],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.order_tracking_updated'),
        ]);

        return redirect()->route('admin.orders.show', $orderNumber);
    }

    public function bulkUpdateStatus(BulkUpdateOrderStatusRequest $request): RedirectResponse
    {
        $status = $request->status();
        $updated = 0;
        $failed = [];

        foreach ($request->orderIds() as $orderId) {
            $order = Order::query()->find($orderId);

            if ($order === null) {
                continue;
            }

            $this->authorize('update', $order);

            try {
                $this->orderStatus->transition($order, $status);
                $updated++;
            } catch (InvalidOrderTransitionException|OrderConfirmStockException) {
                $failed[] = $order->order_number;
            }
        }

        $this->activity->log(
            $request->user(),
            'orders.status.bulk_update',
            properties: [
                'status' => $status->value,
                'updated' => $updated,
                'failed' => $failed,
            ],
            request: $request,
        );

        if ($updated === 0) {
            return back()->withErrors([
                'status' => __('messages.order_bulk_status_failed'),
            ]);
        }

        Inertia::flash('toast', [
            'type' => count($failed) > 0 ? 'warning' : 'success',
            'message' => count($failed) > 0
                ? __('messages.order_bulk_status_partial', [
                    'updated' => $updated,
                    'failed' => count($failed),
                ])
                : __('messages.order_bulk_status_updated', ['count' => $updated]),
        ]);

        return redirect()->route('admin.orders.index');
    }

    public function retryRefund(Request $request, string $orderNumber): RedirectResponse
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->firstOrFail();

        $this->authorize('update', $order);

        if ($order->status !== OrderStatus::Cancelled
            || $order->payment_method !== PaymentMethod::Stripe
            || $order->refund_status !== RefundStatus::Failed) {
            return back()->withErrors([
                'refund' => 'This order is not eligible for a refund retry.',
            ]);
        }

        $this->refunds->refundOrder($order);
        $order->refresh();

        $this->activity->log(
            $request->user(),
            'orders.refund.retry',
            $order,
            ['refund_status' => $order->refund_status?->value],
            $request,
        );

        Inertia::flash('toast', [
            'type' => $order->refund_status === RefundStatus::Refunded ? 'success' : 'error',
            'message' => $order->refund_status === RefundStatus::Refunded
                ? __('messages.order_refund_succeeded')
                : __('messages.order_refund_failed'),
        ]);

        return redirect()->route('admin.orders.show', $orderNumber);
    }

    /**
     * @return Builder<Order>
     */
    private function filteredQuery(?string $status, string $search)
    {
        $query = Order::query()
            ->with(['items', 'user'])
            ->orderByDesc('created_at');

        if (is_string($status) && $status !== '') {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($query) use ($search): void {
                $query->where('order_number', 'like', "%{$search}%")
                    ->orWhere('shipping_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($query) use ($search): void {
                        $query->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        return $query;
    }
}
