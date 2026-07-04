<?php

use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('category listing page renders products for men', function () {
    $response = $this->get(route('category.show', 'men'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/products/index')
            ->where('categoryMeta.slug', 'men')
            ->where('filters.activeDepartment', 'men')
            ->has('products.data')
            ->has('filters')
            ->has('filterOptions.departments')
            ->has('filterOptions.subCategories')
        );
});

test('category listing includes men shoes products', function () {
    $response = $this->get(route('category.show', 'men'));

    $slugs = collect($response->original->getData()['page']['props']['products']['data'])
        ->pluck('slug');

    expect($slugs)->toContain('zegama-2')
        ->and($slugs)->not->toContain('revolution-7');
});

test('subcategory listing page renders men shoes products only', function () {
    $response = $this->get(route('category.show', 'men-shoes'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/products/index')
            ->where('categoryMeta.slug', 'men-shoes')
            ->where('filters.activeDepartment', 'men')
            ->has('filterOptions.subCategories')
        );

    $slugs = collect($response->original->getData()['page']['props']['products']['data'])
        ->pluck('slug');

    expect($slugs)->toContain('zegama-2')
        ->and($slugs)->not->toContain('revolution-7');
});

test('subcategory page still exposes sibling subcategories in filters', function () {
    $response = $this->get(route('category.show', 'men-shoes'));

    $subCategories = collect(
        $response->original->getData()['page']['props']['filterOptions']['subCategories'],
    )->pluck('slug');

    expect($subCategories)->toContain('men-shoes');
});

test('unknown category slug returns 404', function () {
    $this->get(route('category.show', 'invalid-slug'))
        ->assertNotFound();
});

test('category listing ignores gender query param on web plp', function () {
    $response = $this->get(route('category.show', ['category' => 'men', 'gender' => 'Women']));

    $response->assertOk();

    $slugs = collect($response->original->getData()['page']['props']['products']['data'])
        ->pluck('slug');

    expect($slugs)->toContain('zegama-2')
        ->and($slugs)->not->toContain('revolution-7');
});

test('category listing supports pagination', function () {
    $page1 = $this->get(route('category.show', ['category' => 'men', 'per_page' => 2, 'page' => 1]));
    $page2 = $this->get(route('category.show', ['category' => 'men', 'per_page' => 2, 'page' => 2]));

    $page1->assertOk();
    $page2->assertOk();

    $slugs1 = collect($page1->original->getData()['page']['props']['products']['data'])->pluck('slug');
    $slugs2 = collect($page2->original->getData()['page']['props']['products']['data'])->pluck('slug');

    expect($slugs1)->not->toBe($slugs2);
});

test('category listing supports sort query param', function () {
    $response = $this->get(route('category.show', ['category' => 'men', 'sort' => 'price_asc', 'per_page' => 20]));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.sort', 'price_asc')
        );
});
