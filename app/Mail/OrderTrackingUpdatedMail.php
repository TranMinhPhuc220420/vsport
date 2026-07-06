<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderTrackingUpdatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Order $order,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('messages.order_tracking_updated_subject', [
                'order_number' => $this->order->order_number,
            ]),
        );
    }

    public function content(): Content
    {
        $this->order->loadMissing('user');

        return new Content(
            markdown: 'mail.order-tracking-updated',
            with: [
                'greeting' => __('messages.order_confirmation_greeting', [
                    'name' => $this->order->user?->name ?? '',
                ]),
                'body' => __('messages.order_tracking_updated_body', [
                    'order_number' => $this->order->order_number,
                ]),
                'trackUrl' => route('orders.track.show', $this->order->order_number),
            ],
        );
    }
}
