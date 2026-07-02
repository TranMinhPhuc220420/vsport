<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateColorwayInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'variants' => ['required', 'array', 'min:1'],
            'variants.*.id' => ['required', 'integer', 'exists:product_variants,id'],
            'variants.*.quantity' => ['required', 'integer', 'min:0'],
        ];
    }
}
