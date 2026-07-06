<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('messages.order_confirmation_subject', [
                'order_number' => $this->order->order_number,
            ]),
        );
    }

    public function content(): Content
    {
        $customerName = $this->order->user?->name ?? '';

        return new Content(
            markdown: 'mail.order-confirmation',
            with: [
                'greeting' => __('messages.order_confirmation_greeting', [
                    'name' => $customerName,
                ]),
                'body' => __('messages.order_confirmation_body', [
                    'order_number' => $this->order->order_number,
                    'total' => number_format((float) $this->order->total_amount, 2),
                ]),
                'footer' => __('messages.order_confirmation_footer', [
                    'app' => config('app.name'),
                ]),
                'orderUrl' => route('orders.show', $this->order->order_number),
            ],
        );
    }
}
