<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\OrderLookupRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderLookupController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('storefront/orders/lookup', [
            'seo' => PageSeo::forPrivate(
                __('seo.private.order_lookup'),
                route('orders.lookup.create'),
            )->toArray(),
        ]);
    }

    public function store(OrderLookupRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $order = Order::query()
            ->where('order_number', $data['orderNumber'])
            ->first();

        if (! $this->emailMatches($order, $data['email'])) {
            throw ValidationException::withMessages([
                'orderNumber' => __('messages.order_lookup_failed'),
            ]);
        }

        $request->session()->push('guest_order_access', $order->order_number);

        return redirect()->route('orders.confirmation', $order->order_number);
    }

    private function emailMatches(?Order $order, string $email): bool
    {
        if ($order === null) {
            return false;
        }

        $shipping = json_decode($order->shipping_address, true);
        $orderEmail = is_array($shipping) ? ($shipping['email'] ?? null) : null;

        if (! is_string($orderEmail) || $orderEmail === '') {
            return false;
        }

        return strcasecmp($orderEmail, $email) === 0;
    }
}
