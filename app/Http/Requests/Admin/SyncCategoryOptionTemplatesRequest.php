<?php

namespace App\Http\Requests\Admin;

use App\Enums\OptionDisplayType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncCategoryOptionTemplatesRequest extends FormRequest
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
            'templates' => ['required', 'array'],
            'templates.*.id' => ['nullable', 'integer', 'exists:category_option_templates,id'],
            'templates.*.name' => ['required', 'string', 'max:100'],
            'templates.*.position' => ['required', 'integer', 'min:0'],
            'templates.*.displayType' => ['required', Rule::enum(OptionDisplayType::class)],
            'templates.*.isRequired' => ['sometimes', 'boolean'],
            'templates.*.drivesGallery' => ['sometimes', 'boolean'],
            'templates.*.defaultValues' => ['nullable', 'array'],
            'templates.*.defaultValues.*' => ['string', 'max:150'],
            'templates.*.metadata' => ['nullable', 'array'],
        ];
    }
}
