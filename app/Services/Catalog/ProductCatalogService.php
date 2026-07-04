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
    /**
     * @return array<int|string, mixed>
     */
    private function summaryRelations(): array
    {
        return [
            'category',
            'activeColorways.images' => fn ($q) => $q->orderBy('sort_order'),
            'activeColorways.variants.inventory',
        ];
    }

    public function paginateList(ProductListFilters $filters): LengthAwarePaginator
    {
        $query = Product::query()
            ->with($this->summaryRelations());

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
            ->with($this->summaryRelations())
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
        $with = $this->summaryRelations();

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
     * @return Collection<int, Product>
     */
    public function newArrivals(int $limit = 8): Collection
    {
        return Product::query()
            ->with($this->summaryRelations())
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * @return Collection<int, Product>
     */
    public function bestSellers(int $limit = 8): Collection
    {
        return Product::query()
            ->with($this->summaryRelations())
            ->orderByDesc('review_count')
            ->orderByDesc('average_rating')
            ->limit($limit)
            ->get();
    }

    /**
     * @return Collection<int, Product>
     */
    public function relatedProducts(Product $product, int $limit = 8): Collection
    {
        $with = $this->summaryRelations();

        $related = Product::query()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with($with)
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        if ($related->count() >= $limit) {
            return $related;
        }

        $excludeIds = $related->pluck('id')->push($product->id);

        $additional = Product::query()
            ->whereNotIn('id', $excludeIds)
            ->with($with)
            ->orderByDesc('created_at')
            ->limit($limit - $related->count())
            ->get();

        return $related->concat($additional);
    }

    /**
     * @return Collection<int, Category>
     */
    public function topLevelCategories(): Collection
    {
        /** @var list<int> $rootIds */
        $rootIds = Cache::get(CatalogCache::TREE_KEY);

        if (is_array($rootIds) && $rootIds !== []) {
            $categories = Category::query()
                ->whereIn('id', $rootIds)
                ->with('children')
                ->get();

            if ($categories->count() === count($rootIds)) {
                $order = array_flip($rootIds);

                return $categories
                    ->sortBy(fn (Category $category) => $order[$category->id] ?? PHP_INT_MAX)
                    ->values();
            }

            Cache::forget(CatalogCache::TREE_KEY);
        }

        /** @var list<int> $rootIds */
        $rootIds = Category::query()
            ->roots()
            ->orderBy('name')
            ->pluck('id')
            ->all();

        if ($rootIds === []) {
            return new Collection;
        }

        Cache::put(CatalogCache::TREE_KEY, $rootIds, 3600);

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

        if (Cache::has($cacheKey)) {
            $categoryId = Cache::get($cacheKey);

            if (is_int($categoryId)) {
                $category = Category::query()
                    ->where('id', $categoryId)
                    ->with('children')
                    ->first();

                if ($category !== null) {
                    return $category;
                }
            }

            Cache::forget($cacheKey);
        }

        $category = Category::query()
            ->where('slug', $slug)
            ->with('children')
            ->first();

        if ($category !== null) {
            Cache::put($cacheKey, $category->id, 3600);
        }

        return $category;
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
