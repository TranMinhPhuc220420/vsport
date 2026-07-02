<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class UpdateDiscountCodeRequest extends StoreDiscountCodeRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $discount = $this->route('discount_code');

        return [
            ...parent::baseRules(),
            'code' => [
                'required',
                'string',
                'max:50',
                'alpha_dash',
                Rule::unique('discount_codes', 'code')->ignore($discount),
            ],
        ];
    }
}
