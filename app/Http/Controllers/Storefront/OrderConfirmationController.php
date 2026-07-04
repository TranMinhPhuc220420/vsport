<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderConfirmationController extends Controller
{
    public function show(Request $request, string $orderNumber): Response
    {
        $order = Order::query()
            ->where('order_number', $orderNumber)
            ->with('items')
            ->firstOrFail();

        if ($request->user() !== null) {
            $this->authorize('view', $order);
        } elseif (! $this->guestCanView($request, $orderNumber)) {
            abort(403);
        }

        return Inertia::render('storefront/orders/confirmation', [
            'order' => OrderResource::make($order)->resolve(),
            'seo' => PageSeo::forPrivate(
                __('seo.private.order_confirmation'),
                route('orders.confirmation', $orderNumber),
            )->toArray(),
        ]);
    }

    private function guestCanView(Request $request, string $orderNumber): bool
    {
        /** @var list<string> $allowed */
        $allowed = $request->session()->get('guest_order_access', []);

        return in_array($orderNumber, $allowed, true);
    }
}
