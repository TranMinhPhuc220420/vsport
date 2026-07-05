<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class UpdateBlogCategoryRequest extends StoreBlogCategoryRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $category = $this->route('blog_category');

        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('blog_categories', 'slug')->ignore($category?->id),
            ],
            'description' => ['nullable', 'string', 'max:500'],
            'sortOrder' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
