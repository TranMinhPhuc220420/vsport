<?php

namespace App\Http\Requests\Admin;

use App\Support\RichTextHtml;
use Illuminate\Foundation\Http\FormRequest;

class SyncProductContentSectionsRequest extends FormRequest
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
            'sections' => ['present', 'array'],
            'sections.*.title' => ['required', 'string', 'max:200'],
            'sections.*.id' => ['nullable', 'integer', 'exists:product_content_sections,id'],
            'sections.*.content_html' => ['nullable', 'string', 'max:'.RichTextHtml::MAX_LENGTH],
            'sections.*.sortOrder' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
