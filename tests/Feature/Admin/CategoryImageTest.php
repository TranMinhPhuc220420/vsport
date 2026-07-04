<?php

use App\Models\Category;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('admin can upload a category image', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();
    $category = Category::query()->where('slug', 'men')->firstOrFail();

    $this->actingAs($admin)
        ->post(route('admin.categories.image.store', $category), [
            'image' => UploadedFile::fake()->image('men.jpg', 600, 750),
            'image_alt' => 'Men category',
        ])
        ->assertOk()
        ->assertJsonPath('category.imageUrl', fn (?string $url) => is_string($url) && str_contains($url, '/storage/categories/'));

    $category->refresh();

    expect($category->image_path)->toStartWith('categories/'.$category->id.'/')
        ->and($category->image_alt)->toBe('Men category');

    expect(Storage::disk('public')->allFiles('categories/'.$category->id))->not->toBeEmpty();
});

test('admin can replace and delete a category image', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();
    $category = Category::query()->where('slug', 'women')->firstOrFail();

    $this->actingAs($admin)
        ->post(route('admin.categories.image.store', $category), [
            'image' => UploadedFile::fake()->image('women.jpg', 600, 750),
        ])
        ->assertOk();

    $firstPath = $category->fresh()->image_path;

    $this->actingAs($admin)
        ->post(route('admin.categories.image.store', $category), [
            'image' => UploadedFile::fake()->image('women-2.jpg', 600, 750),
        ])
        ->assertOk();

    $secondPath = $category->fresh()->image_path;

    expect($secondPath)->not->toBe($firstPath);
    expect(Storage::disk('public')->exists($firstPath))->toBeFalse();

    $this->actingAs($admin)
        ->delete(route('admin.categories.image.destroy', $category))
        ->assertNoContent();

    $category->refresh();

    expect($category->image_path)->toBeNull()
        ->and($category->image_alt)->toBeNull();
});

test('guest cannot upload category image', function () {
    $category = Category::query()->where('slug', 'men')->firstOrFail();

    $this->post(route('admin.categories.image.store', $category), [
        'image' => UploadedFile::fake()->image('men.jpg'),
    ])->assertRedirect(route('login'));
});

test('admin can update category image alt text', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::query()->where('slug', 'men')->firstOrFail();

    $this->actingAs($admin)
        ->patchJson(route('admin.categories.image-alt.update', $category), [
            'image_alt' => 'Men navigation image',
        ])
        ->assertOk()
        ->assertJsonPath('category.imageAlt', 'Men navigation image');

    expect($category->fresh()->image_alt)->toBe('Men navigation image');
});

test('admin category edit page includes enriched category meta', function () {
    $this->seed(CatalogSeeder::class);

    $admin = User::factory()->admin()->create();
    $men = Category::query()->where('slug', 'men')->firstOrFail();

    $response = $this->actingAs($admin)
        ->get(route('admin.categories.edit', $men));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/categories/edit')
            ->where('category.slug', 'men')
            ->where('category.productsCount', fn ($count) => $count >= 0)
            ->where('category.childrenCount', fn ($count) => $count >= 1)
            ->has('children')
        );

    $children = $response->original->getData()['page']['props']['children'];

    expect(collect($children)->pluck('slug'))->toContain('men-shoes');
});
