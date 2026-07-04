<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Enums\PaymentMethod;
use App\Exceptions\CheckoutStockException;
use App\Exceptions\InvalidDiscountCodeException;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Services\Cart\CartService;
use App\Services\Order\OrderCheckoutService;
use App\Services\Payment\StripeCheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Exception\ApiErrorException;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $cartService,
        private readonly OrderCheckoutService $checkout,
        private readonly StripeCheckoutService $stripe,
    ) {}

    public function create(Request $request): Response
    {
        $user = $request->user();
        $defaults = [
            'customerName' => '',
            'customerEmail' => '',
            'customerPhone' => '',
            'shippingAddress' => '',
        ];

        if ($user !== null) {
            $defaults['customerName'] = $user->name;
            $defaults['customerEmail'] = $user->email;

            $lastOrder = Order::query()
                ->where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->first();

            if ($lastOrder !== null) {
                $shipping = json_decode($lastOrder->shipping_address, true);

                if (is_array($shipping)) {
                    $defaults['customerPhone'] = $shipping['phone'] ?? '';
                    $defaults['shippingAddress'] = $shipping['address'] ?? '';
                }
            }
        }

        return Inertia::render('storefront/checkout', [
            'stripeKey' => config('services.stripe.key'),
            'isGuest' => $user === null,
            'defaults' => $defaults,
            'seo' => PageSeo::forPrivate(__('seo.private.checkout'), route('checkout.create'))->toArray(),
        ]);
    }

    public function store(CheckoutRequest $request): RedirectResponse|Response
    {
        $cart = $this->cartService->resolveCart($request);
        $user = $request->user();
        $payload = $request->validated();

        if ($user !== null && empty($payload['customerEmail'])) {
            $payload['customerEmail'] = $user->email;
        }

        try {
            $order = $this->checkout->createFromCart(
                $cart,
                $user?->id,
                $payload,
            );
        } catch (CheckoutStockException $exception) {
            return back()
                ->withErrors($exception->toMessageBag())
                ->withInput();
        } catch (InvalidDiscountCodeException $exception) {
            return back()
                ->withErrors($exception->toMessageBag())
                ->withInput();
        }

        if ($user === null) {
            $request->session()->push('guest_order_access', $order->order_number);
        }

        if ($order->payment_method === PaymentMethod::Stripe) {
            try {
                $payment = $this->stripe->createPaymentIntent($order);
            } catch (ApiErrorException) {
                return back()->withErrors([
                    'paymentMethod' => 'Unable to start card payment. Please try COD or try again later.',
                ]);
            }

            return Inertia::render('storefront/checkout-stripe', [
                'orderNumber' => $order->order_number,
                'clientSecret' => $payment['clientSecret'],
                'stripeKey' => config('services.stripe.key'),
                'total' => (float) $order->total_amount,
                'seo' => PageSeo::forPrivate(
                    __('seo.private.checkout_stripe'),
                    route('checkout.create'),
                )->toArray(),
            ]);
        }

        return redirect()->route('orders.confirmation', $order->order_number);
    }
}
