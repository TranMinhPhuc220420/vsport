<?php

namespace App\Http\Requests\Admin;

use App\Enums\OptionDisplayType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncProductOptionsRequest extends FormRequest
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
            'options' => ['required', 'array'],
            'options.*.id' => ['nullable', 'integer', 'exists:product_options,id'],
            'options.*.name' => ['required', 'string', 'max:100'],
            'options.*.position' => ['required', 'integer', 'min:0'],
            'options.*.displayType' => ['required', Rule::enum(OptionDisplayType::class)],
            'options.*.isRequired' => ['sometimes', 'boolean'],
            'options.*.drivesGallery' => ['sometimes', 'boolean'],
            'options.*.metadata' => ['nullable', 'array'],
            'options.*.values' => ['required', 'array', 'min:1'],
            'options.*.values.*.id' => ['nullable', 'integer', 'exists:product_option_values,id'],
            'options.*.values.*.value' => ['required', 'string', 'max:150'],
            'options.*.values.*.slug' => ['nullable', 'string', 'max:150'],
            'options.*.values.*.swatchHex' => ['nullable', 'string', 'max:7'],
            'options.*.values.*.sortOrder' => ['nullable', 'integer', 'min:0'],
            'options.*.values.*.salePrice' => ['nullable', 'numeric', 'min:0'],
            'options.*.values.*.metadata' => ['nullable', 'array'],
        ];
    }
}
