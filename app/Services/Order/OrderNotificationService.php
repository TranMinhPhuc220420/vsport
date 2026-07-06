<?php

namespace App\Services\Order;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Mail\OrderConfirmationMail;
use App\Mail\OrderStatusUpdatedMail;
use App\Models\Order;
use Illuminate\Support\Facades\Mail;

class OrderNotificationService
{
    public function sendConfirmation(Order $order): void
    {
        $email = $this->resolveOrderEmail($order);

        if ($email === null) {
            return;
        }

        Mail::to($email)->send(new OrderConfirmationMail($order));
    }

    public function sendConfirmationIfCod(Order $order): void
    {
        if ($order->payment_method !== PaymentMethod::Cod) {
            return;
        }

        $this->sendConfirmation($order);
    }

    public function sendConfirmationIfStripe(Order $order): void
    {
        if ($order->payment_method !== PaymentMethod::Stripe) {
            return;
        }

        $this->sendConfirmation($order);
    }

    public function sendStatusUpdate(Order $order, OrderStatus $previousStatus): void
    {
        $email = $this->resolveOrderEmail($order);

        if ($email === null) {
            return;
        }

        if ($previousStatus === $order->status) {
            return;
        }

        Mail::to($email)->send(new OrderStatusUpdatedMail($order, $previousStatus));
    }

    private function resolveOrderEmail(Order $order): ?string
    {
        $order->loadMissing('user');

        if (is_string($order->user?->email) && $order->user->email !== '') {
            return $order->user->email;
        }

        $shipping = json_decode($order->shipping_address, true);

        if (! is_array($shipping)) {
            return null;
        }

        $email = $shipping['email'] ?? null;

        return is_string($email) && $email !== '' ? $email : null;
    }
}
