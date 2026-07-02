<?php

namespace App\Mail;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
        public readonly OrderStatus $previousStatus,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('messages.order_status_updated_subject', [
                'order_number' => $this->order->order_number,
            ]),
        );
    }

    public function content(): Content
    {
        $customerName = $this->order->user?->name ?? '';

        return new Content(
            markdown: 'mail.order-status-updated',
            with: [
                'greeting' => __('messages.order_confirmation_greeting', [
                    'name' => $customerName,
                ]),
                'body' => __('messages.order_status_updated_body', [
                    'order_number' => $this->order->order_number,
                    'status' => __('messages.order_statuses.'.$this->order->status->value),
                ]),
                'footer' => __('messages.order_confirmation_footer', [
                    'app' => config('app.name'),
                ]),
                'orderUrl' => route('orders.show', $this->order->order_number),
            ],
        );
    }
}
