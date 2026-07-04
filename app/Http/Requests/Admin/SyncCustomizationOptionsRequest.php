<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SyncCustomizationOptionsRequest extends FormRequest
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
            'options' => ['present', 'array'],
            'options.*.componentName' => ['required', 'string', 'max:100'],
            'options.*.allowedMaterials' => ['required', 'array'],
            'options.*.allowedMaterials.*' => ['required', 'string'],
            'options.*.allowedColors' => ['required', 'array'],
            'options.*.allowedColors.*.hex' => ['required', 'string'],
            'options.*.allowedColors.*.name' => ['required', 'string'],
        ];
    }
}
