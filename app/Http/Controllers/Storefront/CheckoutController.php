<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Enums\PaymentMethod;
use App\Exceptions\CheckoutStockException;
use App\Exceptions\InvalidDiscountCodeException;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Models\ShippingAddress;
use App\Models\User;
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
        $savedAddresses = [];

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

            $savedAddresses = $user->addresses->map(fn (ShippingAddress $address) => [
                'id' => $address->id,
                'label' => $address->label,
                'recipientName' => $address->recipient_name,
                'phone' => $address->phone,
                'addressLine' => $address->address_line,
                'isDefault' => $address->is_default,
            ])->values()->all();

            $defaultAddress = $user->addresses->firstWhere('is_default', true);

            if ($defaultAddress !== null) {
                $defaults['customerPhone'] = $defaultAddress->phone;
                $defaults['shippingAddress'] = $defaultAddress->address_line;
            }
        }

        return Inertia::render('storefront/checkout', [
            'stripeKey' => config('services.stripe.key'),
            'isGuest' => $user === null,
            'defaults' => $defaults,
            'savedAddresses' => $savedAddresses,
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

        if ($user !== null && ! empty($payload['saveAddress'])) {
            $this->saveAddressFromPayload($user, $payload);
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

    /**
     * @param  array<string, mixed>  $payload
     */
    private function saveAddressFromPayload(User $user, array $payload): void
    {
        if ($user->addresses()->count() >= 10) {
            return;
        }

        $user->addresses()->create([
            'recipient_name' => $payload['customerName'],
            'phone' => $payload['customerPhone'],
            'address_line' => $payload['shippingAddress'],
            'is_default' => $user->addresses()->count() === 0,
        ]);
    }
}
