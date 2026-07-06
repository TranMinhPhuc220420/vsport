<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\SizeGuide;
use App\Models\SizeGuideRow;
use Database\Seeders\BrandSeeder;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\SizeGuideSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(BrandSeeder::class);
    $this->seed(CatalogSeeder::class);
    $this->seed(SizeGuideSeeder::class);
});

test('product detail includes size guide when product has size option and matching guide', function () {
    $product = Product::query()->where('slug', 'zegama-2')->firstOrFail();

    expect($product->brand_id)->not->toBeNull();

    $response = $this->get(route('products.show', $product->slug));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/products/show')
            ->has('product.sizeGuide.columns')
            ->has('product.sizeGuide.rows')
        );
});

test('product detail omits size guide when product has no size option', function () {
    $product = Product::factory()->create([
        'slug' => 'running-cap-test',
        'name' => 'Running Cap',
    ]);

    $this->get(route('products.show', $product->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('product.sizeGuide', null)
        );
});

test('category linked size guide resolves for products without brand guide', function () {
    $category = Category::query()->where('slug', 'men-shoes')->firstOrFail();
    $product = Product::query()->where('slug', 'zegama-2')->firstOrFail();
    $product->update(['brand_id' => null]);

    $guide = SizeGuide::query()->create([
        'name' => 'Men Shoes Only',
        'category_id' => $category->id,
        'brand_id' => null,
        'columns' => ['US', 'EU'],
        'is_default' => false,
    ]);

    SizeGuideRow::query()->create([
        'size_guide_id' => $guide->id,
        'position' => 0,
        'values' => ['9', '42'],
    ]);

    $this->get(route('products.show', $product->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('product.sizeGuide.name', 'Men Shoes Only')
        );
});
