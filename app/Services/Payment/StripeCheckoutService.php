<?php

namespace App\Services\Payment;

use App\Models\Order;
use App\Services\Order\OrderNotificationService;
use Stripe\Exception\ApiErrorException;
use Stripe\PaymentIntent;
use Stripe\Stripe;

class StripeCheckoutService
{
    public function __construct(
        private readonly OrderNotificationService $notifications,
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
        $intent = PaymentIntent::create([
            'amount' => (int) round((float) $order->total_amount * 100),
            'currency' => 'usd',
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
