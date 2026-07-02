<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Exceptions\InvalidOrderTransitionException;
use App\Exceptions\OrderConfirmStockException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Admin\AdminActivityService;
use App\Services\Admin\OrderExportService;
use App\Services\Order\OrderStatusService;
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
            $this->orderStatus->transition($order, $request->status());
        } catch (InvalidOrderTransitionException|OrderConfirmStockException $exception) {
            return back()->withErrors(['status' => $exception->getMessage()]);
        }

        $this->activity->log(
            $request->user(),
            'orders.status.update',
            $order->fresh(),
            ['status' => $request->status()->value],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.order_status_updated'),
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
