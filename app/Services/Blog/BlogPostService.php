<?php

namespace App\Services\Blog;

use App\Enums\BlogPostStatus;
use App\Models\BlogPost;
use App\Support\RichTextHtml;
use Illuminate\Support\Str;

class BlogPostService
{
    /**
     * @param  array<string, mixed>  $data
     * @param  list<int>  $tagIds
     * @param  list<int>  $productIds
     */
    public function create(array $data, array $tagIds = [], array $productIds = []): BlogPost
    {
        $post = BlogPost::query()->create($this->prepareAttributes($data));

        $this->syncRelations($post, $tagIds, $productIds);

        return $post->fresh(['category', 'tags', 'products']);
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  list<int>  $tagIds
     * @param  list<int>  $productIds
     */
    public function update(BlogPost $post, array $data, array $tagIds = [], array $productIds = []): BlogPost
    {
        $post->update($this->prepareAttributes($data, $post));

        $this->syncRelations($post, $tagIds, $productIds);

        return $post->fresh(['category', 'tags', 'products']);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function prepareAttributes(array $data, ?BlogPost $existing = null): array
    {
        $bodyHtml = RichTextHtml::prepareForStorage($data['body_html'] ?? null);
        $plainBody = $bodyHtml !== null ? trim(strip_tags($bodyHtml)) : null;

        $status = $data['status'] instanceof BlogPostStatus
            ? $data['status']
            : BlogPostStatus::from($data['status']);

        $publishedAt = $data['published_at'] ?? null;

        if ($status === BlogPostStatus::Published && $publishedAt === null) {
            $publishedAt = now();
        }

        if ($status === BlogPostStatus::Draft) {
            $publishedAt = null;
        }

        $slug = $data['slug'] ?? null;
        if ($slug === null || trim($slug) === '') {
            $slug = Str::slug($data['title']);
        }

        $slug = $this->resolveUniqueSlug($slug, $existing?->id);

        $readingTime = max(1, (int) ceil(str_word_count($plainBody ?? '') / 200));

        return [
            'blog_category_id' => $data['blog_category_id'] ?? null,
            'title' => $data['title'],
            'slug' => $slug,
            'excerpt' => $data['excerpt'],
            'body' => $plainBody !== '' ? $plainBody : null,
            'body_html' => $bodyHtml,
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'status' => $status,
            'is_featured' => (bool) ($data['is_featured'] ?? false),
            'published_at' => $publishedAt,
            'author_name' => $data['author_name'] ?? config('app.name', 'Zova Sport'),
            'reading_time_minutes' => $readingTime,
        ];
    }

    /**
     * @param  list<int>  $tagIds
     * @param  list<int>  $productIds
     */
    private function syncRelations(BlogPost $post, array $tagIds, array $productIds): void
    {
        $post->tags()->sync($tagIds);

        $productSync = [];
        foreach (array_values(array_slice($productIds, 0, 3)) as $index => $productId) {
            $productSync[$productId] = ['sort_order' => $index];
        }

        $post->products()->sync($productSync);
    }

    private function resolveUniqueSlug(string $base, ?int $ignoreId = null): string
    {
        $candidate = $base;
        $suffix = 1;

        while (
            BlogPost::query()
                ->where('slug', $candidate)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = "{$base}-{$suffix}";
            $suffix++;
        }

        return $candidate;
    }
}
