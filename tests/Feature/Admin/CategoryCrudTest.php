<?php

use App\Models\Category;
use App\Models\User;
use Database\Seeders\CatalogSeeder;

test('admin can create update and delete a category', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $this->post(route('admin.categories.store'), [
        'name' => 'Accessories',
        'slug' => 'accessories',
        'parent_id' => null,
    ])->assertRedirect(route('admin.categories.index'));

    $category = Category::query()->where('slug', 'accessories')->firstOrFail();

    $this->put(route('admin.categories.update', $category), [
        'name' => 'Gear',
        'slug' => 'gear',
        'parent_id' => null,
    ])->assertRedirect(route('admin.categories.index'));

    expect($category->fresh()->name)->toBe('Gear');

    $this->delete(route('admin.categories.destroy', $category))
        ->assertRedirect(route('admin.categories.index'));

    $this->assertDatabaseMissing('categories', ['id' => $category->id]);
});

test('admin cannot set category parent to its own descendant', function () {
    $this->seed(CatalogSeeder::class);

    $admin = User::factory()->admin()->create();
    $parent = Category::query()->where('slug', 'men')->firstOrFail();
    $child = Category::query()->where('slug', 'men-shoes')->firstOrFail();

    $this->actingAs($admin)
        ->from(route('admin.categories.edit', $parent))
        ->put(route('admin.categories.update', $parent), [
            'name' => $parent->name,
            'slug' => $parent->slug,
            'parent_id' => $child->id,
        ])
        ->assertSessionHasErrors('parent_id');
});

test('admin cannot delete category with products', function () {
    $this->seed(CatalogSeeder::class);

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $category = Category::query()->whereHas('products')->firstOrFail();

    $this->from(route('admin.categories.index'))
        ->delete(route('admin.categories.destroy', $category))
        ->assertRedirect(route('admin.categories.index'))
        ->assertSessionHasErrors('category');
});

test('admin category index returns stats and enriched category rows', function () {
    $this->seed(CatalogSeeder::class);

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $response = $this->get(route('admin.categories.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('admin/categories/index')
        ->has('stats', fn ($stats) => $stats
            ->where('total', Category::query()->count())
            ->where('roots', Category::query()->whereNull('parent_id')->count())
            ->where('missingImages', Category::query()->whereNull('parent_id')->whereNull('image_path')->count())
        )
        ->has('filters', fn ($filters) => $filters
            ->where('search', null)
            ->where('scope', 'all')
        )
        ->has('categories.data', Category::query()->count())
        ->has('categories.data.0', fn ($category) => $category
            ->has('id')
            ->has('name')
            ->has('slug')
            ->has('parentId')
            ->has('imageUrl')
            ->has('imageAlt')
            ->has('productsCount')
            ->has('childrenCount')
            ->has('parentName')
            ->etc()
        )
    );
});

test('admin category index supports search filter', function () {
    $this->seed(CatalogSeeder::class);

    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $men = Category::query()->where('slug', 'men')->firstOrFail();
    $menShoes = Category::query()->where('slug', 'men-shoes')->firstOrFail();

    $response = $this->get(route('admin.categories.index', ['search' => 'men']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('filters.search', 'men')
        ->has('categories.data', 2)
    );

    $ids = collect($response->original->getData()['page']['props']['categories']['data'])
        ->pluck('id')
        ->sort()
        ->values()
        ->all();

    expect($ids)->toBe(collect([$men->id, $menShoes->id])->sort()->values()->all());
});

test('admin category create preselects parent from query string', function () {
    $this->seed(CatalogSeeder::class);

    $admin = User::factory()->admin()->create();
    $men = Category::query()->where('slug', 'men')->firstOrFail();

    $this->actingAs($admin)
        ->get(route('admin.categories.create', ['parent_id' => $men->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/categories/create')
            ->where('defaultParentId', $men->id)
        );
});
