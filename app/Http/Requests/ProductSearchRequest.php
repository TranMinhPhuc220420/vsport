<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductSearchRequest extends FormRequest
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
            'q' => ['nullable', 'string', 'max:150'],
            'page' => ['nullable', 'integer', 'min:1'],
            'sort' => ['nullable', 'string', Rule::in(['newest', 'price_asc', 'price_desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ];
    }

    public function searchQuery(): string
    {
        return trim((string) ($this->validated('q') ?? ''));
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
