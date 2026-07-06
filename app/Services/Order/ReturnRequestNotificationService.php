<?php

namespace App\Services\Order;

use App\Enums\ReturnRequestStatus;
use App\Mail\ReturnRequestStatusMail;
use App\Mail\ReturnRequestSubmittedMail;
use App\Models\ReturnRequest;
use App\Services\Admin\StoreSettingsService;
use Illuminate\Support\Facades\Mail;

class ReturnRequestNotificationService
{
    public function __construct(
        private readonly StoreSettingsService $storeSettings,
    ) {}

    public function sendSubmittedToAdmin(ReturnRequest $returnRequest): void
    {
        $email = $this->storeSettings->profile()['contactEmail'] ?? null;

        if (! is_string($email) || $email === '') {
            return;
        }

        Mail::to($email)->send(new ReturnRequestSubmittedMail($returnRequest));
    }

    public function sendStatusUpdateToCustomer(
        ReturnRequest $returnRequest,
        ReturnRequestStatus $previousStatus,
    ): void {
        if ($previousStatus === $returnRequest->status) {
            return;
        }

        $email = $this->resolveCustomerEmail($returnRequest);

        if ($email === null) {
            return;
        }

        Mail::to($email)->send(new ReturnRequestStatusMail($returnRequest, $previousStatus));
    }

    private function resolveCustomerEmail(ReturnRequest $returnRequest): ?string
    {
        $returnRequest->loadMissing('order.user');

        if (is_string($returnRequest->order->user?->email) && $returnRequest->order->user->email !== '') {
            return $returnRequest->order->user->email;
        }

        $shipping = json_decode($returnRequest->order->shipping_address, true);

        if (! is_array($shipping)) {
            return null;
        }

        $email = $shipping['email'] ?? null;

        return is_string($email) && $email !== '' ? $email : null;
    }
}
