<?php

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;

class OrderTrackingLookupRequest extends FormRequest
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
            'orderNumber' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
        ];
    }
}
