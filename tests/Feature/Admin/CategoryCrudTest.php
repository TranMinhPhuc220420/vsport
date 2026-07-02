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
