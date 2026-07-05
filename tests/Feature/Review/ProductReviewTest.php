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

test('authenticated user can resubmit review without server error', function () {
    $user = User::factory()->create();
    $product = Product::query()->firstOrFail();

    ProductReview::query()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'rating' => 5,
        'title' => 'First take',
        'body' => 'Looks good.',
        'is_approved' => false,
    ]);

    $this->actingAs($user)->post(route('products.reviews.store', $product->slug), [
        'rating' => 3,
        'title' => 'Updated take',
        'body' => 'Changed my mind.',
    ])->assertRedirect()
        ->assertSessionHasNoErrors();

    $review = ProductReview::query()
        ->where('product_id', $product->id)
        ->where('user_id', $user->id)
        ->first();

    expect(ProductReview::query()->where('product_id', $product->id)->count())->toBe(1)
        ->and($review->rating)->toBe(3)
        ->and($review->title)->toBe('Updated take')
        ->and($review->body)->toBe('Changed my mind.')
        ->and($review->is_approved)->toBeFalse();
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

test('authenticated user sees viewerReview on product detail page', function () {
    $user = User::factory()->create();
    $product = Product::query()->firstOrFail();

    ProductReview::query()->create([
        'user_id' => $user->id,
        'product_id' => $product->id,
        'rating' => 4,
        'title' => 'Nice',
        'body' => 'Comfortable fit.',
        'is_approved' => false,
    ]);

    $this->actingAs($user)
        ->get(route('products.show', $product->slug))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/products/show')
            ->where('product.viewerReview.rating', 4)
            ->where('product.viewerReview.isApproved', false)
        );
});

test('review submit redirects back to product detail inertia page', function () {
    $user = User::factory()->create();
    $product = Product::query()->firstOrFail();

    $this->actingAs($user)
        ->from(route('products.show', $product->slug))
        ->post(route('products.reviews.store', $product->slug), [
            'rating' => 5,
            'title' => 'Great',
            'body' => 'Love it.',
        ])
        ->assertRedirect(route('products.show', $product->slug));

    $this->actingAs($user)
        ->get(route('products.show', $product->slug))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/products/show')
            ->has('product.viewerReview')
        );
});

test('guest cannot submit review', function () {
    $product = Product::query()->firstOrFail();

    $this->post(route('products.reviews.store', $product->slug), [
        'rating' => 5,
    ])->assertRedirect(route('login'));
});
