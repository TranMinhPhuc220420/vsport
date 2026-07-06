<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LowStockAlertMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param  list<array{sku: string, productName: string, available: int}>  $items
     */
    public function __construct(
        public readonly array $items,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('messages.low_stock_alert_subject', [
                'count' => count($this->items),
            ]),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.low-stock-alert',
            with: [
                'items' => $this->items,
                'intro' => __('messages.low_stock_alert_intro'),
                'viewLabel' => __('messages.low_stock_alert_view'),
                'inventoryUrl' => route('admin.products.index'),
            ],
        );
    }
}
