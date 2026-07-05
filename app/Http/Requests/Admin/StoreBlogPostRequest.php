<?php

namespace App\Http\Requests\Admin;

use App\Enums\BlogPostStatus;
use App\Support\RichTextHtml;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBlogPostRequest extends FormRequest
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
        return $this->baseRules();
    }

    /**
     * @return array<string, mixed>
     */
    protected function baseRules(?int $ignoreId = null): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'slug' => [
                'nullable',
                'string',
                'max:200',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('blog_posts', 'slug')->ignore($ignoreId),
            ],
            'excerpt' => ['required', 'string', 'max:300'],
            'bodyHtml' => ['nullable', 'string', 'max:'.RichTextHtml::MAX_LENGTH],
            'blogCategoryId' => ['nullable', 'integer', Rule::exists('blog_categories', 'id')],
            'tagIds' => ['nullable', 'array', 'max:10'],
            'tagIds.*' => ['integer', Rule::exists('blog_tags', 'id')],
            'productIds' => ['nullable', 'array', 'max:3'],
            'productIds.*' => ['integer', Rule::exists('products', 'id')],
            'metaTitle' => ['nullable', 'string', 'max:200'],
            'metaDescription' => ['nullable', 'string', 'max:320'],
            'status' => ['required', Rule::enum(BlogPostStatus::class)],
            'isFeatured' => ['boolean'],
            'publishedAt' => ['nullable', 'date'],
            'authorName' => ['nullable', 'string', 'max:100'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $data = parent::validated($key, $default);

        return [
            'title' => $data['title'],
            'slug' => $data['slug'] ?? null,
            'excerpt' => $data['excerpt'],
            'body_html' => $data['bodyHtml'] ?? null,
            'blog_category_id' => $data['blogCategoryId'] ?? null,
            'meta_title' => $data['metaTitle'] ?? null,
            'meta_description' => $data['metaDescription'] ?? null,
            'status' => $data['status'],
            'is_featured' => $data['isFeatured'] ?? false,
            'published_at' => $data['publishedAt'] ?? null,
            'author_name' => $data['authorName'] ?? config('app.name', 'Zova Sport'),
            'tag_ids' => array_values($data['tagIds'] ?? []),
            'product_ids' => array_values($data['productIds'] ?? []),
        ];
    }
}
