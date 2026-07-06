<?php

namespace App\Mail;

use App\Models\ReturnRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReturnRequestSubmittedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly ReturnRequest $returnRequest,
    ) {}

    public function envelope(): Envelope
    {
        $this->returnRequest->loadMissing('order');

        return new Envelope(
            subject: __('messages.return_request_submitted_subject', [
                'order_number' => $this->returnRequest->order->order_number,
            ]),
        );
    }

    public function content(): Content
    {
        $this->returnRequest->loadMissing('order');

        return new Content(
            markdown: 'mail.return-request-submitted',
            with: [
                'body' => __('messages.return_request_submitted_body', [
                    'order_number' => $this->returnRequest->order->order_number,
                ]),
                'adminUrl' => route('admin.return-requests.show', $this->returnRequest),
            ],
        );
    }
}
