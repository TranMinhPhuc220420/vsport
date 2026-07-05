<?php

namespace App\Http\Requests\Admin;

use Illuminate\Validation\Rule;

class UpdateBlogTagRequest extends StoreBlogTagRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $tag = $this->route('blog_tag');

        return [
            'name' => ['required', 'string', 'max:100'],
            'slug' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('blog_tags', 'slug')->ignore($tag?->id),
            ],
        ];
    }
}
