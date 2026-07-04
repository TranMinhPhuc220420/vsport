<?php

use App\Http\Resources\ProductSummaryResource;
use App\Models\Product;
use App\Services\Catalog\ProductCatalogService;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('home page renders storefront home with featured products', function () {
    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/home')
            ->has('featuredProducts.data')
            ->has('newArrivals.data')
            ->has('bestSellers.data')
            ->has('categories.data')
            ->has('campaigns.0.headline')
        );

    $count = count(
        $response->original->getData()['page']['props']['featuredProducts']['data'],
    );

    expect($count)->toBeGreaterThan(0)->toBeLessThanOrEqual(8);
});

test('home page new arrivals and best sellers include catalog items', function () {
    $response = $this->get(route('home'));

    $props = $response->original->getData()['page']['props'];

    $newArrivalSlugs = collect($props['newArrivals']['data'])->pluck('slug');
    $bestSellerSlugs = collect($props['bestSellers']['data'])->pluck('slug');

    expect($newArrivalSlugs)->not->toBeEmpty();
    expect($bestSellerSlugs)->not->toBeEmpty();
    expect(count($props['newArrivals']['data']))->toBeLessThanOrEqual(8);
    expect(count($props['bestSellers']['data']))->toBeLessThanOrEqual(8);
});

test('home page featured products include catalog items', function () {
    $response = $this->get(route('home'));

    $slugs = collect($response->original->getData()['page']['props']['featuredProducts']['data'])
        ->pluck('slug');

    expect($slugs)->toContain('zegama-2');
});

test('home page product summaries include primary image urls', function () {
    $response = $this->get(route('home'));

    $product = $response->original->getData()['page']['props']['newArrivals']['data'][0];

    expect($product['primaryImage'])->toBeArray()
        ->and($product['primaryImage']['url'])->toStartWith('https://');
});

test('product summary falls back to first image when none is marked primary', function () {
    $product = Product::query()->with('activeColorways')->firstOrFail();
    $product->activeColorways->each(
        fn ($colorway) => $colorway->images()->update(['is_primary' => false]),
    );

    $summary = ProductSummaryResource::make(
        app(ProductCatalogService::class)->findBySlug($product->slug),
    )->resolve();

    expect($summary['primaryImage'])->toBeArray()
        ->and($summary['primaryImage']['url'])->not->toBeEmpty();
});
