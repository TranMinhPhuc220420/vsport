<?php

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

    expect($first)->toBeInstanceOf(\App\Models\Category::class)
        ->and($second)->toBeInstanceOf(\App\Models\Category::class)
        ->and($second->slug)->toBe('men');
});

test('topLevelCategories returns Category models from database cache', function () {
    $service = app(ProductCatalogService::class);

    $first = $service->topLevelCategories();
    $second = $service->topLevelCategories();

    expect($first)->not->toBeEmpty()
        ->and($first->first())->toBeInstanceOf(\App\Models\Category::class)
        ->and($second->first())->toBeInstanceOf(\App\Models\Category::class);
});

test('catalog cache invalidation clears slug entries', function () {
    $service = app(ProductCatalogService::class);

    $service->findCategoryBySlug('men');
    expect(Cache::has(CatalogCache::SLUG_PREFIX.'men'))->toBeTrue();

    CatalogCache::forget();

    expect(Cache::has(CatalogCache::SLUG_PREFIX.'men'))->toBeFalse();
});
