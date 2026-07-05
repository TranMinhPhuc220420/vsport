<?php

use App\Models\Product;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('public');
    $this->seed(CatalogSeeder::class);
});

test('product detail page exposes descriptionHtml in inertia props', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->firstOrFail();

    $this->actingAs($admin)->put(route('admin.products.update', $product), [
        'style_code' => $product->style_code,
        'name' => $product->name,
        'slug' => $product->slug,
        'description' => '',
        'description_html' => '<p><strong>Rich</strong> details</p>',
        'category_id' => $product->category_id,
        'sub_title' => $product->sub_title,
        'base_price' => (string) $product->base_price,
        'gender' => $product->gender->value,
        'is_customizable' => $product->is_customizable,
    ])->assertRedirect();

    $this->get(route('products.show', $product->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/products/show')
            ->where('product.descriptionHtml', '<p><strong>Rich</strong> details</p>')
            ->where('product.description', 'Rich details'));
});

test('product seo description stays plain text when html is stored', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->firstOrFail();

    $this->actingAs($admin)->put(route('admin.products.update', $product), [
        'style_code' => $product->style_code,
        'name' => $product->name,
        'slug' => $product->slug,
        'description' => '',
        'description_html' => '<p>Performance <em>running</em> shoe</p>',
        'category_id' => $product->category_id,
        'sub_title' => $product->sub_title,
        'base_price' => (string) $product->base_price,
        'gender' => $product->gender->value,
        'is_customizable' => $product->is_customizable,
    ])->assertRedirect();

    $this->get(route('products.show', $product->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.description', 'Performance running shoe')
            ->where('structuredData.0.description', 'Performance running shoe'));
});
