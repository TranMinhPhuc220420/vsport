<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class ShippingAddressRequest extends FormRequest
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
            'label' => ['nullable', 'string', 'max:100'],
            'recipientName' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:30'],
            'addressLine' => ['required', 'string', 'max:1000'],
            'isDefault' => ['nullable', 'boolean'],
        ];
    }
}
