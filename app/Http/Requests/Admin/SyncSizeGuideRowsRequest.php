<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SyncSizeGuideRowsRequest extends FormRequest
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
            'columns' => ['required', 'array', 'min:1'],
            'columns.*' => ['required', 'string', 'max:20'],
            'rows' => ['present', 'array'],
            'rows.*.id' => ['nullable', 'integer', 'exists:size_guide_rows,id'],
            'rows.*.position' => ['required', 'integer', 'min:0'],
            'rows.*.values' => ['required', 'array'],
            'rows.*.values.*' => ['nullable', 'string', 'max:150'],
        ];
    }
}
