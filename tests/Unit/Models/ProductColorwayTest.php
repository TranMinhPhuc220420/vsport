<?php

use App\Models\Product;
use App\Models\ProductColorway;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('effective price uses discount when set', function () {
    $product = Product::factory()->create(['base_price' => 100]);

    $colorway = ProductColorway::factory()->create([
        'product_id' => $product->id,
        'discount_price' => 80,
    ]);

    expect($colorway->effectivePrice())->toBe(80.0);
});

test('effective price falls back to product base price', function () {
    $product = Product::factory()->create(['base_price' => 100]);

    $colorway = ProductColorway::factory()->create([
        'product_id' => $product->id,
        'discount_price' => null,
    ]);

    expect($colorway->effectivePrice())->toBe(100.0);
});
