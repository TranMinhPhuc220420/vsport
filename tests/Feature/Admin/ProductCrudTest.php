<?php

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('admin can create a product with category option templates and variants', function () {
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
    ])->assertRedirect();

    $product = Product::query()->where('slug', 'admin-test-shoe')->firstOrFail();

    expect($product->options)->toHaveCount(2)
        ->and($product->variants)->toHaveCount(10);

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

test('admin can batch update product variant inventory', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->with('variants.inventory')->firstOrFail();
    $variants = $product->variants->take(2);

    $this->actingAs($admin)
        ->patch(route('admin.products.variants.inventory.update', $product), [
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
        ->with('options.values.images')
        ->firstOrFail();

    $expectedUrl = null;
    foreach ($product->options as $option) {
        if (! $option->drives_gallery) {
            continue;
        }

        foreach ($option->values as $value) {
            $primary = $value->images->firstWhere('is_primary', true)
                ?? $value->images->first();

            if ($primary !== null) {
                $expectedUrl = $primary->image_url;
                break 2;
            }
        }
    }

    expect($expectedUrl)->not->toBeNull();

    $this->actingAs($admin)
        ->get(route('admin.products.index', ['search' => $product->name]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/products/index')
            ->where('products.data.0.thumbnailUrl', $expectedUrl));
});
