<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
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
            'customerName' => ['required', 'string', 'max:150'],
            'customerPhone' => ['required', 'string', 'max:30'],
            'shippingAddress' => ['required', 'string', 'max:1000'],
            'customerEmail' => [
                Rule::requiredIf($this->user() === null),
                'nullable',
                'email',
                'max:255',
            ],
            'discountCode' => ['nullable', 'string', 'max:50'],
            'paymentMethod' => ['nullable', 'string', 'in:cod,stripe'],
            'saveAddress' => ['nullable', 'boolean'],
        ];
    }
}
