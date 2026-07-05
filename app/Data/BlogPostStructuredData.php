<?php

namespace App\Data;

use App\Models\BlogPost;
use App\Services\Admin\StoreSettingsService;
use App\Services\ProductImageStorage;

readonly class BlogPostStructuredData
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function forPost(BlogPost $post, ?string $featuredImage = null): array
    {
        return [
            self::blogPosting($post, $featuredImage),
            self::breadcrumbList($post),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function blogPosting(BlogPost $post, ?string $featuredImage = null): array
    {
        $storage = app(ProductImageStorage::class);
        $image = $featuredImage ?? $storage->urlFor(
            $post->featured_image_url,
            $post->featured_image_path,
        );

        $description = $post->meta_description
            ?: PageSeo::truncate($post->excerpt);

        $settings = app(StoreSettingsService::class)->profile();
        $publisherName = config('app.name', 'Zova Sport');
        $publisher = [
            '@type' => 'Organization',
            'name' => $publisherName,
        ];

        if (! empty($settings['logoUrl'])) {
            $publisher['logo'] = [
                '@type' => 'ImageObject',
                'url' => $settings['logoUrl'],
            ];
        }

        $data = [
            '@context' => 'https://schema.org',
            '@type' => 'BlogPosting',
            'headline' => $post->title,
            'description' => $description,
            'url' => route('blog.show', $post->slug),
            'datePublished' => $post->published_at?->toAtomString(),
            'dateModified' => $post->updated_at?->toAtomString(),
            'author' => [
                '@type' => 'Organization',
                'name' => $post->author_name,
            ],
            'publisher' => $publisher,
        ];

        if ($image !== null && $image !== '') {
            $data['image'] = [$image];
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    public static function breadcrumbList(BlogPost $post): array
    {
        $post->loadMissing('category');

        $items = [
            [
                '@type' => 'ListItem',
                'position' => 1,
                'name' => __('seo.breadcrumb.home'),
                'item' => route('home'),
            ],
            [
                '@type' => 'ListItem',
                'position' => 2,
                'name' => __('seo.breadcrumb.blog'),
                'item' => route('blog.index'),
            ],
        ];

        $position = 3;

        if ($post->category !== null) {
            $items[] = [
                '@type' => 'ListItem',
                'position' => $position++,
                'name' => $post->category->name,
                'item' => route('blog.index', ['category' => $post->category->slug]),
            ];
        }

        $items[] = [
            '@type' => 'ListItem',
            'position' => $position,
            'name' => $post->title,
            'item' => route('blog.show', $post->slug),
        ];

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $items,
        ];
    }
}
