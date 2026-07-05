<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class UpdateBrandRequest extends StoreBrandRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $brand = $this->route('brand');

        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => [
                'nullable',
                'string',
                'max:150',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('brands', 'slug')->ignore($brand?->id),
            ],
        ];
    }
}
