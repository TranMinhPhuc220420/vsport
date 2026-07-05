<?php

use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('admin blog categories index lists categories with posts count', function () {
    $admin = User::factory()->admin()->create();
    $category = BlogCategory::factory()->create(['name' => 'Guides', 'slug' => 'guides']);
    BlogPost::factory()->published()->create(['blog_category_id' => $category->id]);

    $this->actingAs($admin)
        ->get(route('admin.blog-categories.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/blog-categories/index')
            ->has('categories.data', 1)
            ->where('categories.data.0.slug', 'guides')
            ->where('categories.data.0.postsCount', 1)
        );
});

test('admin can update blog category', function () {
    $admin = User::factory()->admin()->create();
    $category = BlogCategory::factory()->create([
        'name' => 'Guides',
        'slug' => 'guides',
    ]);

    $this->actingAs($admin)->put(route('admin.blog-categories.update', $category), [
        'name' => 'Updated Guides',
        'slug' => 'updated-guides',
        'description' => 'Updated description',
        'sortOrder' => 2,
    ])->assertRedirect(route('admin.blog-categories.index'));

    $category->refresh();

    expect($category->name)->toBe('Updated Guides')
        ->and($category->slug)->toBe('updated-guides')
        ->and($category->description)->toBe('Updated description')
        ->and($category->sort_order)->toBe(2);
});

test('admin cannot delete blog category that has posts', function () {
    $admin = User::factory()->admin()->create();
    $category = BlogCategory::factory()->create();
    BlogPost::factory()->create(['blog_category_id' => $category->id]);

    $this->actingAs($admin)
        ->from(route('admin.blog-categories.index'))
        ->delete(route('admin.blog-categories.destroy', $category))
        ->assertRedirect(route('admin.blog-categories.index'))
        ->assertSessionHasErrors('category');

    expect(BlogCategory::query()->whereKey($category->id)->exists())->toBeTrue();
});

test('admin can delete empty blog category', function () {
    $admin = User::factory()->admin()->create();
    $category = BlogCategory::factory()->create();

    $this->actingAs($admin)
        ->delete(route('admin.blog-categories.destroy', $category))
        ->assertRedirect(route('admin.blog-categories.index'));

    expect(BlogCategory::query()->whereKey($category->id)->exists())->toBeFalse();
});
