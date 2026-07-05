<?php

namespace App\Http\Resources;

use App\Models\BlogPost;
use App\Services\ProductImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin BlogPost
 */
class BlogPostResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $storage = app(ProductImageStorage::class);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'bodyHtml' => $this->body_html,
            'featuredImageUrl' => $storage->urlFor(
                $this->featured_image_url,
                $this->featured_image_path,
            ),
            'featuredImageAlt' => $this->featured_image_alt,
            'metaTitle' => $this->meta_title,
            'metaDescription' => $this->meta_description,
            'status' => $this->status->value,
            'isFeatured' => $this->is_featured,
            'publishedAt' => $this->published_at?->toIso8601String(),
            'readingTimeMinutes' => $this->reading_time_minutes,
            'authorName' => $this->author_name,
            'category' => $this->whenLoaded(
                'category',
                fn () => $this->category !== null
                    ? BlogCategoryResource::make($this->category)->resolve()
                    : null,
            ),
            'tags' => $this->whenLoaded(
                'tags',
                fn () => BlogTagResource::collection($this->tags)->resolve(),
            ),
            'products' => $this->whenLoaded(
                'products',
                fn () => ProductSummaryResource::collection($this->products)->resolve(),
            ),
        ];
    }
}
