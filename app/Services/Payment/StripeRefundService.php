<?php

namespace App\Services\Payment;

use App\Enums\PaymentMethod;
use App\Enums\RefundStatus;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\ApiErrorException;
use Stripe\Refund;
use Stripe\Stripe;

class StripeRefundService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Refund a cancelled order's Stripe payment, if applicable.
     *
     * Only orders paid via Stripe and cancelled from a status where stock had
     * already been deducted (confirmed/shipping/delivered) are refunded —
     * cancelling from `pending` never deducted stock, so the payment may not
     * have been captured yet and is left alone. Idempotent: a second call on
     * an order that already has a `refund_id` is a no-op.
     */
    public function refundOrder(Order $order): void
    {
        if ($order->payment_method !== PaymentMethod::Stripe) {
            return;
        }

        if ($order->refund_id !== null) {
            return;
        }

        if ($order->payment_intent_id === null) {
            return;
        }

        try {
            $refund = Refund::create([
                'payment_intent' => $order->payment_intent_id,
            ]);

            $order->update([
                'refund_id' => $refund->id,
                'refund_status' => RefundStatus::Refunded,
                'refunded_at' => now(),
            ]);
        } catch (ApiErrorException $exception) {
            $order->update([
                'refund_status' => RefundStatus::Failed,
            ]);

            Log::error('stripe.refund.failed', [
                'order_number' => $order->order_number,
                'payment_intent_id' => $order->payment_intent_id,
                'message' => $exception->getMessage(),
            ]);
        }
    }
}
