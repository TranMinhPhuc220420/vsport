<?php

use App\Models\Category;
use App\Services\Catalog\ProductCatalogService;
use App\Support\CatalogCache;
use Database\Seeders\CatalogSeeder;
use Illuminate\Support\Facades\Cache;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
    config(['cache.default' => 'database']);
    Cache::flush();
});

test('findCategoryBySlug returns a Category model from database cache', function () {
    $service = app(ProductCatalogService::class);

    $first = $service->findCategoryBySlug('men');
    $second = $service->findCategoryBySlug('men');

    expect($first)->toBeInstanceOf(Category::class)
        ->and($second)->toBeInstanceOf(Category::class)
        ->and($second->slug)->toBe('men');
});

test('topLevelCategories returns Category models from database cache', function () {
    $service = app(ProductCatalogService::class);

    $first = $service->topLevelCategories();
    $second = $service->topLevelCategories();

    expect($first)->not->toBeEmpty()
        ->and($first->first())->toBeInstanceOf(Category::class)
        ->and($second->first())->toBeInstanceOf(Category::class);
});

test('catalog cache invalidation clears slug entries', function () {
    $service = app(ProductCatalogService::class);

    $service->findCategoryBySlug('men');
    expect(Cache::has(CatalogCache::SLUG_PREFIX.'men'))->toBeTrue();

    CatalogCache::forget();

    expect(Cache::has(CatalogCache::SLUG_PREFIX.'men'))->toBeFalse();
});

test('findCategoryBySlug recovers from stale cached category id', function () {
    $service = app(ProductCatalogService::class);
    $men = Category::query()->where('slug', 'men')->firstOrFail();

    Cache::put(CatalogCache::SLUG_PREFIX.'men', $men->id + 99999, 3600);

    $category = $service->findCategoryBySlug('men');

    expect($category)->toBeInstanceOf(Category::class)
        ->and($category->slug)->toBe('men');
});
