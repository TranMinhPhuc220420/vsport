<?php

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\Catalog\ProductCatalogService;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('category resource collection resolves nested children', function () {
    $resolved = array_values(
        CategoryResource::collection(
            app(ProductCatalogService::class)->topLevelCategories(),
        )->resolve(),
    );

    $men = collect($resolved)->firstWhere('slug', 'men');

    expect($men)->not->toBeNull()
        ->and($men['children'])->toBeArray()
        ->and(collect($men['children'])->pluck('slug'))->toContain('men-shoes');
});

test('inertia shares navigation categories with nested children', function () {
    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page->has('navigation.categories'));

    $categories = $response->original->getData()['page']['props']['navigation']['categories'];
    $men = collect($categories)->firstWhere('slug', 'men');

    expect($men)->not->toBeNull()
        ->and($men['children'])->toBeArray()
        ->and(collect($men['children'])->pluck('slug'))->toContain('men-shoes');
});

test('category resource exposes image fields and children', function () {
    $men = Category::query()
        ->where('slug', 'men')
        ->with('children')
        ->firstOrFail();

    $men->update([
        'image_path' => 'categories/'.$men->id.'/sample.jpg',
        'image_alt' => 'Men',
    ]);

    $payload = CategoryResource::make($men->fresh('children'))->resolve();

    expect($payload)->toHaveKeys(['imageUrl', 'imageAlt', 'children'])
        ->and($payload['imageAlt'])->toBe('Men')
        ->and(collect($payload['children'])->pluck('slug'))->toContain('men-shoes');
});

test('top level categories include eager loaded children', function () {
    $categories = app(ProductCatalogService::class)->topLevelCategories();

    $men = $categories->firstWhere('slug', 'men');

    expect($men)->not->toBeNull()
        ->and($men->relationLoaded('children'))->toBeTrue()
        ->and($men->children->pluck('slug'))->toContain('men-shoes');
});
