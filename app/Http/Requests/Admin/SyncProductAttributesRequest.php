<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductAttributeGroup;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncProductAttributesRequest extends FormRequest
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
            'attributes' => ['required', 'array'],
            'attributes.*.group' => ['required', Rule::enum(ProductAttributeGroup::class)],
            'attributes.*.key' => ['required', 'string', 'max:100'],
            'attributes.*.label' => ['required', 'string', 'max:150'],
            'attributes.*.value' => ['required', 'string'],
            'attributes.*.sortOrder' => ['nullable', 'integer', 'min:0'],
            'attributes.*.optionValueId' => ['nullable', 'integer', 'exists:product_option_values,id'],
        ];
    }
}
