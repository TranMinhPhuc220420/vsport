<?php

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;

test('guest cannot access wishlist api', function () {
    $this->getJson('/api/wishlist')->assertUnauthorized();
});

test('authenticated user can add a product to their wishlist', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/wishlist/items', [
        'productSlug' => $product->slug,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.items.0.productSlug', $product->slug);

    expect(Wishlist::query()->where('user_id', $user->id)->firstOrFail()->items)->toHaveCount(1);
});

test('adding the same product twice does not duplicate it', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $this->actingAs($user)->postJson('/api/wishlist/items', ['productSlug' => $product->slug]);
    $this->actingAs($user)->postJson('/api/wishlist/items', ['productSlug' => $product->slug]);

    expect(Wishlist::query()->where('user_id', $user->id)->first()->items)->toHaveCount(1);
});

test('authenticated user can remove a product from their wishlist', function () {
    $user = User::factory()->create();
    $product = Product::factory()->create();

    $this->actingAs($user)->postJson('/api/wishlist/items', ['productSlug' => $product->slug]);

    $response = $this->actingAs($user)->deleteJson("/api/wishlist/items/{$product->slug}");

    $response->assertOk()
        ->assertJsonCount(0, 'data.items');

    expect(Wishlist::query()->where('user_id', $user->id)->first()->items)->toHaveCount(0);
});

test('authenticated user can list their wishlist', function () {
    $user = User::factory()->create();
    $productA = Product::factory()->create();
    $productB = Product::factory()->create();

    $this->actingAs($user)->postJson('/api/wishlist/items', ['productSlug' => $productA->slug]);
    $this->actingAs($user)->postJson('/api/wishlist/items', ['productSlug' => $productB->slug]);

    $this->actingAs($user)->getJson('/api/wishlist')
        ->assertOk()
        ->assertJsonCount(2, 'data.items');
});

test('one users wishlist does not leak into anothers', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $product = Product::factory()->create();

    $this->actingAs($owner)->postJson('/api/wishlist/items', ['productSlug' => $product->slug]);

    $this->actingAs($other)->getJson('/api/wishlist')
        ->assertOk()
        ->assertJsonCount(0, 'data.items');
});

test('merge adds guest wishlist slugs to the users server wishlist', function () {
    $user = User::factory()->create();
    $existing = Product::factory()->create();
    $fromGuest = Product::factory()->create();

    $this->actingAs($user)->postJson('/api/wishlist/items', ['productSlug' => $existing->slug]);

    $response = $this->actingAs($user)->postJson('/api/wishlist/merge', [
        'slugs' => [$existing->slug, $fromGuest->slug],
    ]);

    $response->assertOk()->assertJsonCount(2, 'data.items');

    expect(Wishlist::query()->where('user_id', $user->id)->first()->items)->toHaveCount(2);
});
