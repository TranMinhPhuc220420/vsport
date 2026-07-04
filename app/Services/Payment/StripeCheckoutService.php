<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Services\Admin\StoreSettingsService;
use App\Services\Order\OrderNotificationService;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class StripeCheckoutService
{
    /**
     * Currencies Stripe treats as zero-decimal (the integer amount already
     * represents the whole currency unit — no ×100 conversion).
     *
     * @see https://docs.stripe.com/currencies#zero-decimal
     *
     * @var list<string>
     */
    private const ZERO_DECIMAL_CURRENCIES = [
        'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg',
        'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
    ];

    public function __construct(
        private readonly OrderNotificationService $notifications,
        private readonly StoreSettingsService $storeSettings,
    ) {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * @return array{paymentIntentId: string, clientSecret: string}
     *
     * @throws ApiErrorException
     */
    public function createPaymentIntent(Order $order): array
    {
        $currency = strtolower($this->storeSettings->profile()['currency'] ?? 'usd');

        $intent = PaymentIntent::create([
            'amount' => $this->toStripeAmount((float) $order->total_amount, $currency),
            'currency' => $currency,
            'metadata' => [
                'order_number' => $order->order_number,
            ],
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        $order->update(['payment_intent_id' => $intent->id]);

        return [
            'paymentIntentId' => $intent->id,
            'clientSecret' => $intent->client_secret,
        ];
    }

    private function toStripeAmount(float $amount, string $currency): int
    {
        if (in_array($currency, self::ZERO_DECIMAL_CURRENCIES, true)) {
            return (int) round($amount);
        }

        return (int) round($amount * 100);
    }

    public function handlePaymentSucceeded(string $paymentIntentId): ?Order
    {
        $order = Order::query()
            ->where('payment_intent_id', $paymentIntentId)
            ->first();

        if ($order === null) {
            return null;
        }

        $this->notifications->sendConfirmationIfStripe($order);

        return $order;
    }
}
