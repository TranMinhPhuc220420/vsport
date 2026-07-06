<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\StoreReturnRequestRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\Order\ReturnRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnRequestController extends Controller
{
    public function __construct(
        private readonly ReturnRequestService $returnRequests,
    ) {}

    public function create(Request $request, string $orderNumber): Response
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        $this->authorize('view', $order);

        $eligibility = $this->returnRequests->eligibility($order);

        return Inertia::render('storefront/orders/return-request', [
            'order' => OrderResource::make($order)->resolve(),
            'eligibility' => $eligibility,
            'seo' => PageSeo::forPrivate(
                __('seo.private.return_request', ['order_number' => $orderNumber]),
                route('orders.returns.create', $orderNumber),
            )->toArray(),
        ]);
    }

    public function store(
        StoreReturnRequestRequest $request,
        string $orderNumber,
    ): RedirectResponse {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        $this->authorize('view', $order);

        $returnRequest = $this->returnRequests->create(
            $order,
            $request->user(),
            $request->validated('reason'),
            $request->returnItems(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.return_request_submitted'),
        ]);

        return redirect()->route('orders.show', $orderNumber);
    }
}
