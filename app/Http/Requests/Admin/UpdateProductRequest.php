<?php

namespace App\Http\Requests\Admin;

use App\Enums\ProductGender;
use App\Support\RichTextHtml;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
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
        $product = $this->route('product');

        return [
            'style_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('products', 'style_code')->ignore($product?->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($product?->id),
            ],
            'description' => ['nullable', 'string'],
            'description_html' => ['nullable', 'string', 'max:'.RichTextHtml::MAX_LENGTH],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'brand_id' => ['nullable', 'integer', 'exists:brands,id'],
            'sub_title' => ['nullable', 'string', 'max:255'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'gender' => ['required', 'string', Rule::in(array_column(ProductGender::cases(), 'value'))],
            'is_customizable' => ['sometimes', 'boolean'],
        ];
    }
}
