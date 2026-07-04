<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with('items')
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('storefront/orders/index', [
            'orders' => OrderResource::collection($orders),
            'seo' => PageSeo::forPrivate(
                __('seo.private.orders'),
                route('orders.index'),
            )->toArray(),
        ]);
    }

    public function show(Request $request, string $orderNumber): Response
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        $this->authorize('view', $order);

        return Inertia::render('storefront/orders/show', [
            'order' => OrderResource::make($order)->resolve(),
            'seo' => PageSeo::forPrivate(
                __('seo.private.order_detail', ['order_number' => $orderNumber]),
                route('orders.show', $orderNumber),
            )->toArray(),
        ]);
    }
}
