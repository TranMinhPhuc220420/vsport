<?php

namespace App\Http\Resources;

use App\Models\BlogPost;
use App\Services\ProductImageStorage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin BlogPost
 */
class BlogPostSummaryResource extends JsonResource
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
            'featuredImageUrl' => $storage->urlFor(
                $this->featured_image_url,
                $this->featured_image_path,
            ),
            'featuredImageAlt' => $this->featured_image_alt,
            'publishedAt' => $this->published_at?->toIso8601String(),
            'readingTimeMinutes' => $this->reading_time_minutes,
            'authorName' => $this->author_name,
            'isFeatured' => $this->is_featured,
            'category' => $this->whenLoaded(
                'category',
                fn () => $this->category !== null
                    ? BlogCategoryResource::make($this->category)->resolve()
                    : null,
            ),
        ];
    }
}
