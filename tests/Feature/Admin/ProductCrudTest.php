<?php

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductColorway;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('admin can create a product with colorway variants and inventory', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::query()->where('slug', 'men-shoes')->firstOrFail();

    $this->actingAs($admin)->post(route('admin.products.store'), [
        'style_code' => 'ADM-100',
        'name' => 'Admin Test Shoe',
        'slug' => 'admin-test-shoe',
        'description' => 'Test product',
        'category_id' => $category->id,
        'sub_title' => 'Test subtitle',
        'base_price' => 120,
        'gender' => 'Men',
        'colorway_code' => '100',
        'color_name' => 'White',
        'sizes' => ['US 8', 'US 9'],
    ])->assertRedirect();

    $product = Product::query()->where('slug', 'admin-test-shoe')->firstOrFail();

    expect($product->colorways)->toHaveCount(1)
        ->and($product->colorways->first()->variants)->toHaveCount(2);

    $this->get(route('admin.products.edit', $product))->assertOk();
});

test('admin can update inventory quantity', function () {
    $admin = User::factory()->admin()->create();
    $variant = ProductVariant::query()->firstOrFail();
    $inventory = Inventory::query()->where('variant_id', $variant->id)->firstOrFail();

    $this->actingAs($admin)
        ->patch(route('admin.variants.inventory.update', $variant), [
            'quantity' => 25,
        ])
        ->assertRedirect();

    expect($inventory->fresh()->quantity)->toBe(25);
});

test('admin can batch update colorway inventory', function () {
    $admin = User::factory()->admin()->create();
    $colorway = ProductColorway::query()->with('variants.inventory')->firstOrFail();
    $variants = $colorway->variants;

    $this->actingAs($admin)
        ->patch(route('admin.colorways.inventory.update', $colorway), [
            'variants' => $variants->map(fn (ProductVariant $variant) => [
                'id' => $variant->id,
                'quantity' => 12,
            ])->all(),
        ])
        ->assertRedirect();

    foreach ($variants as $variant) {
        expect($variant->fresh()->inventory?->quantity)->toBe(12);
    }
});

test('admin product index supports search and category filter', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::query()->where('slug', 'men-shoes')->firstOrFail();
    $product = Product::query()->firstOrFail();

    $this->actingAs($admin)
        ->get(route('admin.products.index', [
            'search' => $product->name,
            'category' => $category->id,
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/products/index')
            ->has('filters')
            ->has('categories'));
});

test('admin product index includes thumbnail url from primary image', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()
        ->with('colorways.images')
        ->firstOrFail();

    $expectedUrl = $product->colorways
        ->flatMap(fn ($colorway) => $colorway->images)
        ->firstWhere('is_primary', true)
        ?->image_url
        ?? $product->colorways->flatMap(fn ($colorway) => $colorway->images)->first()?->image_url;

    expect($expectedUrl)->not->toBeNull();

    $this->actingAs($admin)
        ->get(route('admin.products.index', ['search' => $product->name]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/products/index')
            ->where('products.data.0.thumbnailUrl', $expectedUrl));
});
