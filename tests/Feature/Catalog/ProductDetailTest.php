<?php

use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('product detail returns colorways variants and stock', function () {
    $response = $this->getJson('/api/products/zegama-2');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'slug',
                'colorways' => [
                    '*' => [
                        'id',
                        'colorName',
                        'images',
                        'variants' => [
                            '*' => [
                                'size',
                                'sku',
                                'unitPrice',
                                'stock' => ['available', 'inStock'],
                            ],
                        ],
                    ],
                ],
            ],
        ]);

    expect($response->json('data.colorways.0.variants.0.stock.inStock'))->toBeBool();
});

test('unknown product slug returns 404', function () {
    $this->getJson('/api/products/unknown-product')
        ->assertNotFound()
        ->assertJson(['message' => 'Resource not found.']);
});

test('out of stock variant shows inStock false', function () {
    $response = $this->getJson('/api/products/jordan-1-low');

    $variants = collect($response->json('data.colorways'))
        ->flatMap(fn (array $colorway) => $colorway['variants']);

    $size12 = $variants->firstWhere('size', 'US 12');

    expect($size12)->not->toBeNull()
        ->and($size12['stock']['inStock'])->toBeFalse()
        ->and($size12['stock']['available'])->toBe(0);
});
