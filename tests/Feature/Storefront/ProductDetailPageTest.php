<?php

use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('product detail page renders with options and stock', function () {
    $response = $this->get(route('products.show', 'zegama-2'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/products/show')
            ->where('product.slug', 'zegama-2')
            ->has('product.options', 2)
            ->has('product.variants')
            ->has('product.variants.0.stock.inStock')
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

test('product detail page includes sale pricing on discounted color option value', function () {
    $response = $this->get(route('products.show', 'zegama-2'));

    $options = $response->original->getData()['page']['props']['product']['options'];
    $colorOption = collect($options)->firstWhere('name', 'Color');

    expect($colorOption['values'][0]['salePrice'])->toBe(135.0);
});

test('product detail page returns 404 for unknown slug', function () {
    $response = $this->get(route('products.show', 'does-not-exist'));

    $response->assertNotFound();
});

test('jordan 1 low has out of stock variant in seeded data', function () {
    $response = $this->get(route('products.show', 'jordan-1-low'));

    $response->assertOk();

    $product = $response->original->getData()['page']['props']['product'];
    $sizeOption = collect($product['options'])->firstWhere('name', 'Size');
    $us12Id = collect($sizeOption['values'])->firstWhere('value', 'US 12')['id'];
    $us12 = collect($product['variants'])->first(
        fn (array $variant) => in_array($us12Id, $variant['optionValueIds'], true),
    );

    expect($us12)->not->toBeNull()
        ->and($us12['stock']['inStock'])->toBeFalse();
});
