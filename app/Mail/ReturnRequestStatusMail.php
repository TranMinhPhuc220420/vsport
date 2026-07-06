<?php

namespace App\Mail;

use App\Enums\ReturnRequestStatus;
use App\Models\ReturnRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReturnRequestStatusMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly ReturnRequest $returnRequest,
        public readonly ReturnRequestStatus $previousStatus,
    ) {}

    public function envelope(): Envelope
    {
        $this->returnRequest->loadMissing('order');

        return new Envelope(
            subject: __('messages.return_request_status_subject', [
                'order_number' => $this->returnRequest->order->order_number,
            ]),
        );
    }

    public function content(): Content
    {
        $this->returnRequest->loadMissing('order');

        return new Content(
            markdown: 'mail.return-request-status',
            with: [
                'body' => __('messages.return_request_status_body', [
                    'order_number' => $this->returnRequest->order->order_number,
                    'status' => __('messages.return_request_statuses.'.$this->returnRequest->status->value),
                ]),
                'orderUrl' => route('orders.show', $this->returnRequest->order->order_number),
            ],
        );
    }
}
