<?php

use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('product detail page includes seo metadata', function () {
    $response = $this->get(route('products.show', 'jordan-1-low'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/products/show')
            ->has('seo')
            ->where('seo.title', fn ($title) => str_contains($title, 'Jordan'))
            ->where('seo.description', fn ($description) => is_string($description) && $description !== '')
            ->where('seo.canonical', route('products.show', 'jordan-1-low'))
        );
});

test('category listing page includes seo metadata', function () {
    $this->get(route('category.show', 'men'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('seo')
            ->where('seo.canonical', route('category.show', 'men'))
        );
});

test('home page includes seo metadata', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('seo')
            ->where('seo.canonical', route('home'))
        );
});

test('seeded product images expose alt text in api', function () {
    $response = $this->getJson('/api/products/jordan-1-low');

    $response->assertOk();

    $payload = $response->json('data') ?? $response->json();
    $colorways = $payload['colorways'] ?? [];

    $images = collect($colorways)->flatMap(fn (array $colorway) => $colorway['images'] ?? []);

    expect($images)->not->toBeEmpty();

    $images->each(fn (array $image) => expect($image['alt'])->not->toBeEmpty());
});

test('cart and checkout pages use noindex seo', function () {
    $user = User::factory()->create();

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', 'noindex, nofollow'));

    $this->actingAs($user)
        ->get(route('checkout.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', 'noindex, nofollow'));
});
