<?php

use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('product detail page renders with colorways and stock', function () {
    $response = $this->get(route('products.show', 'zegama-2'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/products/show')
            ->where('product.slug', 'zegama-2')
            ->has('product.colorways', 2)
            ->has('product.colorways.0.variants')
            ->has('product.colorways.0.variants.0.stock.inStock')
            ->has('relatedProducts.data')
        );
});

test('product detail page includes related products from catalog', function () {
    $response = $this->get(route('products.show', 'zegama-2'));

    $related = $response->original->getData()['page']['props']['relatedProducts']['data'];

    expect($related)->not->toBeEmpty();
    expect(collect($related)->pluck('slug'))->not->toContain('zegama-2');
    expect(count($related))->toBeLessThanOrEqual(8);
});

test('product detail page includes sale pricing on discounted colorway', function () {
    $response = $this->get(route('products.show', 'zegama-2'));

    $colorways = $response->original->getData()['page']['props']['product']['colorways'];

    expect($colorways[0]['discountPrice'])->toBe(135.0);
});

test('product detail page returns 404 for unknown slug', function () {
    $response = $this->get(route('products.show', 'does-not-exist'));

    $response->assertNotFound();
});

test('jordan 1 low has out of stock variant in seeded data', function () {
    $response = $this->get(route('products.show', 'jordan-1-low'));

    $response->assertOk();

    $colorways = $response->original->getData()['page']['props']['product']['colorways'];
    $variants = collect($colorways)->flatMap(fn ($c) => $c['variants']);
    $us12 = $variants->firstWhere('size', 'US 12');

    expect($us12)->not->toBeNull()
        ->and($us12['stock']['inStock'])->toBeFalse();
});
