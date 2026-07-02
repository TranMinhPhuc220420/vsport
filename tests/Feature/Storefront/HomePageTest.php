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
            ->has('categories.data')
            ->has('campaign.headline')
        );

    $count = count(
        $response->original->getData()['page']['props']['featuredProducts']['data'],
    );

    expect($count)->toBeGreaterThan(0)->toBeLessThanOrEqual(8);
});

test('home page featured products include catalog items', function () {
    $response = $this->get(route('home'));

    $slugs = collect($response->original->getData()['page']['props']['featuredProducts']['data'])
        ->pluck('slug');

    expect($slugs)->toContain('zegama-2');
});
