<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\OrderTrackingLookupRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderTrackingController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('storefront/orders/track-lookup', [
            'seo' => PageSeo::forPrivate(
                __('seo.private.order_tracking'),
                route('orders.track.create'),
            )->toArray(),
        ]);
    }

    public function store(OrderTrackingLookupRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $order = Order::query()
            ->where('order_number', $data['orderNumber'])
            ->with('user')
            ->first();

        if (! $this->emailMatches($order, $data['email'])) {
            throw ValidationException::withMessages([
                'orderNumber' => __('messages.order_lookup_failed'),
            ]);
        }

        $request->session()->push('guest_order_access', $order->order_number);

        return redirect()->route('orders.track.show', $order->order_number);
    }

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

        return Inertia::render('storefront/orders/track-show', [
            'order' => OrderResource::make($order)->resolve(),
            'seo' => PageSeo::forPrivate(
                __('seo.private.order_tracking_detail', ['order_number' => $orderNumber]),
                route('orders.track.show', $orderNumber),
            )->toArray(),
        ]);
    }

    private function guestCanView(Request $request, string $orderNumber): bool
    {
        /** @var list<string> $allowed */
        $allowed = $request->session()->get('guest_order_access', []);

        return in_array($orderNumber, $allowed, true);
    }

    private function emailMatches(?Order $order, string $email): bool
    {
        if ($order === null) {
            return false;
        }

        $order->loadMissing('user');

        if ($order->user?->email !== null && strcasecmp($order->user->email, $email) === 0) {
            return true;
        }

        $shipping = json_decode($order->shipping_address, true);
        $orderEmail = is_array($shipping) ? ($shipping['email'] ?? null) : null;

        if (! is_string($orderEmail) || $orderEmail === '') {
            return false;
        }

        return strcasecmp($orderEmail, $email) === 0;
    }
}
