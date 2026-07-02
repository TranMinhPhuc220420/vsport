<?php

use App\Models\ProductColorway;
use App\Models\ProductImage;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->seed(CatalogSeeder::class);
});

test('admin can upload a product image with storage path', function () {
    $admin = User::factory()->admin()->create();
    $colorway = ProductColorway::query()->firstOrFail();
    $initialCount = $colorway->images()->count();

    $response = $this->actingAs($admin)->postJson(
        route('admin.colorways.images.store', $colorway),
        [
            'image' => UploadedFile::fake()->image('product.jpg'),
            'image_alt_tag' => 'Test alt',
        ],
    );

    $response->assertCreated()
        ->assertJsonStructure([
            'image' => ['id', 'url', 'alt', 'isPrimary', 'sortOrder'],
        ]);

    $image = ProductImage::query()->latest('id')->first();

    expect($image)->not->toBeNull()
        ->and($image->storage_path)->not->toBeNull()
        ->and($image->image_alt_tag)->toBe('Test alt')
        ->and($colorway->images()->count())->toBe($initialCount + 1);

    Storage::disk('public')->assertExists($image->storage_path);
});

test('first uploaded image for empty colorway becomes primary with sort order', function () {
    $admin = User::factory()->admin()->create();
    $colorway = ProductColorway::query()->firstOrFail();
    $colorway->images()->delete();

    $this->actingAs($admin)->postJson(
        route('admin.colorways.images.store', $colorway),
        ['image' => UploadedFile::fake()->image('first.jpg')],
    )->assertCreated();

    $first = ProductImage::query()->where('colorway_id', $colorway->id)->first();

    expect($first)->not->toBeNull()
        ->and($first->is_primary)->toBeTrue()
        ->and($first->sort_order)->toBe(0);

    $this->actingAs($admin)->postJson(
        route('admin.colorways.images.store', $colorway),
        ['image' => UploadedFile::fake()->image('second.jpg')],
    )->assertCreated();

    $second = ProductImage::query()
        ->where('colorway_id', $colorway->id)
        ->orderByDesc('id')
        ->first();

    expect($second->is_primary)->toBeFalse()
        ->and($second->sort_order)->toBe(1);
});

test('admin can set a different primary image', function () {
    $admin = User::factory()->admin()->create();
    $colorway = ProductColorway::query()->with('images')->firstOrFail();

    $target = $colorway->images->firstWhere('is_primary', false)
        ?? $colorway->images->last();

    $this->actingAs($admin)->patchJson(route('admin.images.update', $target), [
        'is_primary' => true,
    ])->assertOk();

    $colorway->refresh()->load('images');

    expect($colorway->images->where('is_primary', true))->toHaveCount(1)
        ->and($colorway->images->firstWhere('id', $target->id)?->is_primary)->toBeTrue();
});

test('admin can reorder colorway images', function () {
    $admin = User::factory()->admin()->create();
    $colorway = ProductColorway::query()->with('images')->firstOrFail();
    $images = $colorway->images->sortBy('sort_order')->values();
    $reversed = $images->reverse()->pluck('id')->all();

    $this->actingAs($admin)->postJson(
        route('admin.colorways.images.reorder', $colorway),
        ['order' => $reversed],
    )->assertOk()
        ->assertJsonCount($images->count(), 'images');

    $colorway->refresh()->load('images');

    expect(
        $colorway->images->sortBy('sort_order')->pluck('id')->all(),
    )->toBe($reversed);
});

test('admin can delete uploaded image and remove file from storage', function () {
    $admin = User::factory()->admin()->create();
    $colorway = ProductColorway::query()->firstOrFail();

    $this->actingAs($admin)->postJson(
        route('admin.colorways.images.store', $colorway),
        ['image' => UploadedFile::fake()->image('delete-me.jpg')],
    )->assertCreated();

    $image = ProductImage::query()->whereNotNull('storage_path')->latest('id')->firstOrFail();
    $path = $image->storage_path;

    $this->actingAs($admin)->deleteJson(route('admin.images.destroy', $image))
        ->assertOk();

    expect(ProductImage::query()->whereKey($image->id)->exists())->toBeFalse();
    Storage::disk('public')->assertMissing($path);
});

test('admin can delete seed image without storage path', function () {
    $admin = User::factory()->admin()->create();
    $image = ProductImage::query()->whereNull('storage_path')->firstOrFail();

    $this->actingAs($admin)->deleteJson(route('admin.images.destroy', $image))
        ->assertOk();

    expect(ProductImage::query()->whereKey($image->id)->exists())->toBeFalse();
});

test('deleting primary image promotes next image by sort order', function () {
    $admin = User::factory()->admin()->create();
    $colorway = ProductColorway::query()->with('images')->firstOrFail();
    $primary = $colorway->images->firstWhere('is_primary', true)
        ?? $colorway->images->sortBy('sort_order')->first();

    $this->actingAs($admin)->deleteJson(route('admin.images.destroy', $primary))
        ->assertOk();

    $colorway->refresh()->load('images');

    if ($colorway->images->isEmpty()) {
        expect($colorway->images)->toBeEmpty();
    } else {
        expect($colorway->images->where('is_primary', true))->toHaveCount(1);
    }
});

test('customer cannot upload product images', function () {
    $user = User::factory()->create();
    $colorway = ProductColorway::query()->firstOrFail();

    $this->actingAs($user)->postJson(
        route('admin.colorways.images.store', $colorway),
        ['image' => UploadedFile::fake()->image('product.jpg')],
    )->assertForbidden();
});

test('guest cannot upload product images', function () {
    $colorway = ProductColorway::query()->firstOrFail();

    $this->postJson(
        route('admin.colorways.images.store', $colorway),
        ['image' => UploadedFile::fake()->image('product.jpg')],
    )->assertRedirect(route('login'));
});
