<?php

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
