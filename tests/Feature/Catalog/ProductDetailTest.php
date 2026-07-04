<?php

use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('product detail returns options variants and stock', function () {
    $response = $this->getJson('/api/products/zegama-2');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'slug',
                'options' => [
                    '*' => [
                        'id',
                        'name',
                        'values',
                    ],
                ],
                'variants' => [
                    '*' => [
                        'sku',
                        'optionValueIds',
                        'unitPrice',
                        'stock' => ['available', 'inStock'],
                    ],
                ],
            ],
        ]);

    expect($response->json('data.variants.0.stock.inStock'))->toBeBool();
});

test('unknown product slug returns 404', function () {
    $this->getJson('/api/products/unknown-product')
        ->assertNotFound()
        ->assertJson(['message' => 'Resource not found.']);
});

test('out of stock variant shows inStock false', function () {
    $response = $this->getJson('/api/products/jordan-1-low');
    $data = $response->json('data');

    $sizeOption = collect($data['options'])->firstWhere('name', 'Size');
    $us12Id = collect($sizeOption['values'])->firstWhere('value', 'US 12')['id'];

    $size12 = collect($data['variants'])->first(
        fn (array $variant) => in_array($us12Id, $variant['optionValueIds'], true),
    );

    expect($size12)->not->toBeNull()
        ->and($size12['stock']['inStock'])->toBeFalse()
        ->and($size12['stock']['available'])->toBe(0);
});
