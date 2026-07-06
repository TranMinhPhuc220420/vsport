<?php

namespace App\Http\Requests\Admin;

use App\Enums\ReturnRequestStatus;
use App\Models\ReturnRequest;
use App\Services\Order\ReturnRequestService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReturnRequestStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var ReturnRequest $returnRequest */
        $returnRequest = $this->route('returnRequest');
        $allowed = app(ReturnRequestService::class)->allowedNextStatuses($returnRequest);

        return [
            'status' => ['required', 'string', Rule::in($allowed)],
            'adminNotes' => [
                Rule::requiredIf($this->input('status') === ReturnRequestStatus::Rejected->value),
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    public function status(): ReturnRequestStatus
    {
        return ReturnRequestStatus::from($this->validated('status'));
    }
}
