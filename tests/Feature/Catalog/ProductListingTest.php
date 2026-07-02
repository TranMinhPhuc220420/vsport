<?php

use App\Models\Product;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('product listing returns paginated results', function () {
    $response = $this->getJson('/api/products');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'slug',
                    'gender',
                    'basePrice',
                    'inStock',
                ],
            ],
            'links',
            'meta',
        ]);
});

test('product listing filters by category slug', function () {
    $response = $this->getJson('/api/products?category=men');

    $response->assertOk();

    $slugs = collect($response->json('data'))->pluck('slug');

    expect($slugs)->toContain('zegama-2')
        ->and($slugs)->not->toContain('revolution-7');
});

test('product listing supports pagination', function () {
    $page1 = $this->getJson('/api/products?per_page=2&page=1')->json('data');
    $page2 = $this->getJson('/api/products?per_page=2&page=2')->json('data');

    expect($page1)->not->toBe($page2);
});

test('product listing sorts by price ascending', function () {
    $response = $this->getJson('/api/products?sort=price_asc&per_page=20');

    $prices = collect($response->json('data'))->pluck('basePrice')->all();

    expect($prices)->toBe(collect($prices)->sort()->values()->all());
});
