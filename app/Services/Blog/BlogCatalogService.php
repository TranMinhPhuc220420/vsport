<?php

namespace App\Services\Blog;

use App\Models\BlogPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class BlogCatalogService
{
    public function paginatePublished(
        ?string $categorySlug = null,
        ?string $tagSlug = null,
        int $perPage = 15,
    ): LengthAwarePaginator {
        return BlogPost::query()
            ->published()
            ->with(['category', 'tags'])
            ->when(
                $categorySlug,
                fn ($query) => $query->whereHas(
                    'category',
                    fn ($categoryQuery) => $categoryQuery->where('slug', $categorySlug),
                ),
            )
            ->when(
                $tagSlug,
                fn ($query) => $query->whereHas(
                    'tags',
                    fn ($tagQuery) => $tagQuery->where('slug', $tagSlug),
                ),
            )
            ->orderByDesc('published_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function findPublishedBySlug(string $slug): ?BlogPost
    {
        return BlogPost::query()
            ->published()
            ->with([
                'category',
                'tags',
                'products.category',
                'products.options.values.images' => fn ($query) => $query->orderBy('sort_order'),
                'products.variants.inventory',
            ])
            ->where('slug', $slug)
            ->first();
    }

    /**
     * @return Collection<int, BlogPost>
     */
    public function featuredForHomepage(int $limit = 8): Collection
    {
        return BlogPost::query()
            ->published()
            ->where('is_featured', true)
            ->with('category')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get();
    }

    /**
     * @return Collection<int, BlogPost>
     */
    public function relatedPosts(BlogPost $post, int $limit = 3): Collection
    {
        $tagIds = $post->tags->pluck('id');

        return BlogPost::query()
            ->published()
            ->where('id', '!=', $post->id)
            ->where(function ($query) use ($post, $tagIds): void {
                $query->where('blog_category_id', $post->blog_category_id);

                if ($tagIds->isNotEmpty()) {
                    $query->orWhereHas(
                        'tags',
                        fn ($tagQuery) => $tagQuery->whereIn('blog_tags.id', $tagIds),
                    );
                }
            })
            ->with('category')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get();
    }

    /**
     * @return Collection<int, BlogPost>
     */
    public function latestForFeed(int $limit = 20): Collection
    {
        return BlogPost::query()
            ->published()
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get();
    }
}
