<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductGender;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
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
            'style_code' => ['required', 'string', 'max:50', 'unique:products,style_code'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'sub_title' => ['nullable', 'string', 'max:255'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'gender' => ['required', 'string', Rule::in(array_column(ProductGender::cases(), 'value'))],
            'is_customizable' => ['sometimes', 'boolean'],
            'options' => ['nullable', 'array'],
        ];
    }
}
