<?php

use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('authenticated user can submit a product review', function () {
    $user = User::factory()->create();
    $product = Product::query()->firstOrFail();

    $this->actingAs($user)->post(route('products.reviews.store', $product->slug), [
        'rating' => 5,
        'title' => 'Great shoe',
        'body' => 'Very comfortable.',
    ])->assertRedirect();

    expect(ProductReview::query()->where('product_id', $product->id)->count())->toBe(1);
});

test('admin approving review updates product aggregates', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $product = Product::query()->firstOrFail();

    $review = ProductReview::query()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'rating' => 4,
        'title' => 'Solid',
        'body' => 'Good value.',
        'is_approved' => false,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.reviews.approve', $review))
        ->assertRedirect();

    $product->refresh();

    expect($product->review_count)->toBe(1)
        ->and((float) $product->average_rating)->toBe(4.0);
});

test('guest cannot submit review', function () {
    $product = Product::query()->firstOrFail();

    $this->post(route('products.reviews.store', $product->slug), [
        'rating' => 5,
    ])->assertRedirect(route('login'));
});
