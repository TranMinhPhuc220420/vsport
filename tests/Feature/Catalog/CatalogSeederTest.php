<?php

use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductVariant;
use Database\Seeders\CatalogSeeder;

test('catalog seeder creates sample catalog data', function () {
    $this->seed(CatalogSeeder::class);

    expect(Product::query()->count())->toBeGreaterThan(0)
        ->and(ProductOption::query()->count())->toBeGreaterThan(0)
        ->and(ProductVariant::query()->count())->toBeGreaterThan(0)
        ->and(Inventory::query()->count())->toBeGreaterThan(0);
});
