<?php

namespace App\Http\Requests\Admin;

use App\Enums\ShippingCarrier;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderTrackingRequest extends FormRequest
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
        return [
            'trackingNumber' => ['nullable', 'string', 'max:100'],
            'shippingCarrier' => ['nullable', 'string', Rule::enum(ShippingCarrier::class)],
        ];
    }
}
