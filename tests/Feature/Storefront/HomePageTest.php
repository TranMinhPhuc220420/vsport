<?php

use App\Enums\BlogPostStatus;
use App\Http\Resources\ProductSummaryResource;
use App\Models\BlogPost;
use App\Models\Product;
use App\Services\Catalog\ProductCatalogService;
use Database\Seeders\BlogSeeder;
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
            ->has('navigation.categories')
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

test('home page includes featured blog posts', function () {
    $this->seed(BlogSeeder::class);

    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/home')
            ->has('featuredPosts.data', 8)
        );

    $featuredPosts = collect(
        $response->original->getData()['page']['props']['featuredPosts']['data'],
    );

    expect($featuredPosts->pluck('slug'))->toContain('cach-chon-size-giay-chay-dung');
    expect($featuredPosts->every(fn ($post) => $post['isFeatured'] === true))->toBeTrue();
});

test('home page excludes non featured blog posts', function () {
    $this->seed(BlogSeeder::class);

    BlogPost::factory()->published()->create([
        'title' => 'Non Featured Post',
        'slug' => 'non-featured-post',
        'is_featured' => false,
    ]);

    $response = $this->get(route('home'));

    $slugs = collect(
        $response->original->getData()['page']['props']['featuredPosts']['data'],
    )->pluck('slug');

    expect($slugs)->not->toContain('non-featured-post');
});

test('home page excludes scheduled blog posts', function () {
    $this->seed(BlogSeeder::class);

    BlogPost::factory()->create([
        'title' => 'Scheduled Home Post',
        'slug' => 'scheduled-home-post',
        'status' => BlogPostStatus::Published,
        'is_featured' => true,
        'published_at' => now()->addWeek(),
    ]);

    $response = $this->get(route('home'));

    $slugs = collect(
        $response->original->getData()['page']['props']['featuredPosts']['data'],
    )->pluck('slug');

    expect($slugs)->not->toContain('scheduled-home-post');
});

test('product summary falls back to first image when none is marked primary', function () {
    $product = Product::query()->with(['options.values.images'])->firstOrFail();
    foreach ($product->options as $option) {
        if (! $option->drives_gallery) {
            continue;
        }

        foreach ($option->values as $value) {
            $value->images()->update(['is_primary' => false]);
        }
    }

    $summary = ProductSummaryResource::make(
        app(ProductCatalogService::class)->findBySlug($product->slug),
    )->resolve();

    expect($summary['primaryImage'])->toBeArray()
        ->and($summary['primaryImage']['url'])->not->toBeEmpty();
});
