<?php

namespace App\Services\Catalog;

use App\Data\ProductListFilters;
use App\Models\Category;
use App\Models\Product;
use App\Support\CatalogCache;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

class ProductCatalogService
{
    public function paginateList(ProductListFilters $filters): LengthAwarePaginator
    {
        $query = Product::query()
            ->with([
                'category',
                'activeColorways.images' => fn ($q) => $q->where('is_primary', true),
                'activeColorways.variants.inventory',
            ]);

        if ($filters->category) {
            $category = $this->findCategoryBySlug($filters->category);

            if ($category) {
                $categoryIds = Category::query()
                    ->where('id', $category->id)
                    ->orWhere('parent_id', $category->id)
                    ->pluck('id');

                $query->whereIn('category_id', $categoryIds);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if ($filters->gender) {
            $query->where('gender', $filters->gender);
        }

        $query = match ($filters->sort) {
            'price_asc' => $query->orderBy('base_price'),
            'price_desc' => $query->orderByDesc('base_price'),
            default => $query->orderByDesc('created_at'),
        };

        return $query->paginate($filters->perPage);
    }

    public function paginateSearch(string $search, string $sort = 'newest', int $perPage = 12): LengthAwarePaginator
    {
        $query = Product::query()
            ->with([
                'category',
                'activeColorways.images' => fn ($q) => $q->where('is_primary', true),
                'activeColorways.variants.inventory',
            ])
            ->where(function ($query) use ($search): void {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('style_code', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('sub_title', 'like', "%{$search}%");
            });

        $query = match ($sort) {
            'price_asc' => $query->orderBy('base_price'),
            'price_desc' => $query->orderByDesc('base_price'),
            default => $query->orderByDesc('created_at'),
        };

        return $query->paginate($perPage);
    }

    /**
     * @return Collection<int, Product>
     */
    public function featured(int $limit = 4): Collection
    {
        $with = [
            'category',
            'activeColorways.images' => fn ($q) => $q->where('is_primary', true),
            'activeColorways.variants.inventory',
        ];

        $featured = Product::query()
            ->where('is_featured', true)
            ->with($with)
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get();

        if ($featured->count() >= $limit) {
            return $featured;
        }

        $excludeIds = $featured->pluck('id');

        $additional = Product::query()
            ->when(
                $excludeIds->isNotEmpty(),
                fn ($query) => $query->whereNotIn('id', $excludeIds),
            )
            ->with($with)
            ->orderByDesc('created_at')
            ->limit($limit - $featured->count())
            ->get();

        return $featured->concat($additional);
    }

    /**
     * @return Collection<int, Category>
     */
    public function topLevelCategories(): Collection
    {
        /** @var list<int> $rootIds */
        $rootIds = Cache::remember(CatalogCache::TREE_KEY, 3600, fn () => Category::query()
            ->roots()
            ->orderBy('name')
            ->pluck('id')
            ->all());

        if ($rootIds === []) {
            return new Collection;
        }

        $order = array_flip($rootIds);

        return Category::query()
            ->whereIn('id', $rootIds)
            ->with('children')
            ->get()
            ->sortBy(fn (Category $category) => $order[$category->id] ?? PHP_INT_MAX)
            ->values();
    }

    public function findCategoryBySlug(string $slug): ?Category
    {
        $cacheKey = CatalogCache::SLUG_PREFIX.$slug;

        if (! Cache::has($cacheKey)) {
            $category = Category::query()
                ->where('slug', $slug)
                ->with('children')
                ->first();

            Cache::put($cacheKey, $category?->id, 3600);

            return $category;
        }

        $categoryId = Cache::get($cacheKey);

        if ($categoryId === null) {
            return null;
        }

        return Category::query()
            ->where('id', $categoryId)
            ->with('children')
            ->first();
    }

    public function findBySlug(string $slug): Product
    {
        return Product::query()
            ->where('slug', $slug)
            ->with([
                'category',
                'activeColorways.images' => fn ($q) => $q->orderBy('sort_order'),
                'activeColorways.variants.inventory',
                'activeColorways.sustainabilityMaterials',
                'activeColorways.nikeByYouOptions',
                'approvedReviews.user',
            ])
            ->firstOrFail();
    }
}
