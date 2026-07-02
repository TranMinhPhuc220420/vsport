<?php

namespace App\Http\Requests;

use App\Enums\ProductGender;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductIndexRequest extends FormRequest
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
            'category' => ['nullable', 'string', 'max:150'],
            'gender' => ['nullable', 'string', Rule::in(array_column(ProductGender::cases(), 'value'))],
            'page' => ['nullable', 'integer', 'min:1'],
            'sort' => ['nullable', 'string', Rule::in(['newest', 'price_asc', 'price_desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ];
    }

    public function perPage(): int
    {
        return (int) ($this->validated('per_page') ?? 12);
    }

    public function sort(): string
    {
        return $this->validated('sort') ?? 'newest';
    }
}
