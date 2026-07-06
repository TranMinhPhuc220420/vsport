<?php

use App\Models\Brand;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\BrandSeeder;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(BrandSeeder::class);
    $this->seed(CatalogSeeder::class);
});

test('admin can create update and delete a brand', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.brands.store'), [
            'name' => 'On Running',
            'slug' => 'on-running',
        ])
        ->assertRedirect(route('admin.brands.index'));

    $brand = Brand::query()->where('slug', 'on-running')->firstOrFail();

    $this->actingAs($admin)
        ->put(route('admin.brands.update', $brand), [
            'name' => 'On',
            'slug' => 'on',
        ])
        ->assertRedirect(route('admin.brands.index'));

    expect($brand->fresh()->name)->toBe('On')
        ->and($brand->fresh()->slug)->toBe('on');

    $this->actingAs($admin)
        ->delete(route('admin.brands.destroy', $brand))
        ->assertRedirect(route('admin.brands.index'));

    $this->assertDatabaseMissing('brands', ['id' => $brand->id]);
});

test('admin cannot delete a brand that still has products', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->whereNotNull('brand_id')->firstOrFail();
    $brand = $product->brand;

    $this->actingAs($admin)
        ->from(route('admin.brands.index'))
        ->delete(route('admin.brands.destroy', $brand))
        ->assertRedirect(route('admin.brands.index'))
        ->assertSessionHasErrors('brand');
});

test('admin product edit exposes assigned brand', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->where('slug', 'zegama-2')->firstOrFail();
    $brand = $product->brand;

    expect($brand)->not->toBeNull();

    $this->actingAs($admin)
        ->get(route('admin.products.edit', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/products/edit')
            ->where('product.brandId', $brand->id)
            ->has('brands')
        );
});

test('admin can assign a brand when updating a product', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create(['brand_id' => null]);
    $brand = Brand::query()->firstOrFail();

    $this->actingAs($admin)
        ->put(route('admin.products.update', $product), [
            'style_code' => $product->style_code,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'category_id' => $product->category_id,
            'brand_id' => $brand->id,
            'sub_title' => $product->sub_title,
            'base_price' => (float) $product->base_price,
            'gender' => $product->gender->value,
        ])
        ->assertRedirect();

    expect($product->fresh()->brand_id)->toBe($brand->id);
});

test('product detail and listing expose brand name when assigned', function () {
    $product = Product::query()->where('slug', 'zegama-2')->firstOrFail();

    expect($product->brand)->not->toBeNull();

    $this->get(route('products.show', $product->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('product.brandName', $product->brand->name)
        );

    $this->get(route('category.show', 'men'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('products.data', fn (Assert $products) => $products
                ->where('0.brandName', fn ($name) => $name === null || is_string($name))
                ->etc()
            )
        );
});
