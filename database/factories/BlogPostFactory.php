<?php

namespace Database\Factories;

use App\Enums\BlogPostStatus;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BlogPost>
 */
class BlogPostFactory extends Factory
{
    protected $model = BlogPost::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(6);
        $bodyHtml = '<p>'.fake()->paragraphs(3, true).'</p>';
        $plain = strip_tags($bodyHtml);

        return [
            'blog_category_id' => BlogCategory::factory(),
            'title' => rtrim($title, '.'),
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 999),
            'excerpt' => Str::limit($plain, 160),
            'body' => $plain,
            'body_html' => $bodyHtml,
            'featured_image_url' => null,
            'featured_image_path' => null,
            'featured_image_alt' => null,
            'meta_title' => null,
            'meta_description' => null,
            'status' => BlogPostStatus::Draft,
            'is_featured' => false,
            'published_at' => null,
            'author_name' => config('app.name', 'Zova Sport'),
            'reading_time_minutes' => max(1, (int) ceil(str_word_count($plain) / 200)),
        ];
    }

    public function published(): static
    {
        return $this->state(fn (): array => [
            'status' => BlogPostStatus::Published,
            'published_at' => now()->subDay(),
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (): array => [
            'is_featured' => true,
        ]);
    }
}
