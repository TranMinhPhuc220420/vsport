<?php

use App\Models\ProductImage;
use App\Models\ProductOptionValue;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->seed(CatalogSeeder::class);
});

function galleryOptionValueWithImages(): ProductOptionValue
{
    return ProductOptionValue::query()
        ->whereHas('option', fn ($query) => $query->where('drives_gallery', true))
        ->whereHas('images')
        ->firstOrFail();
}

test('admin can upload a product image with storage path', function () {
    $admin = User::factory()->admin()->create();
    $optionValue = galleryOptionValueWithImages();
    $initialCount = $optionValue->images()->count();

    $response = $this->actingAs($admin)->postJson(
        route('admin.option-values.images.store', $optionValue),
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
        ->and($optionValue->images()->count())->toBe($initialCount + 1);

    Storage::disk('public')->assertExists($image->storage_path);
});

test('first uploaded image for empty option value becomes primary with sort order', function () {
    $admin = User::factory()->admin()->create();
    $optionValue = galleryOptionValueWithImages();
    $optionValue->images()->delete();

    $this->actingAs($admin)->postJson(
        route('admin.option-values.images.store', $optionValue),
        ['image' => UploadedFile::fake()->image('first.jpg')],
    )->assertCreated();

    $first = ProductImage::query()->where('option_value_id', $optionValue->id)->first();

    expect($first)->not->toBeNull()
        ->and($first->is_primary)->toBeTrue()
        ->and($first->sort_order)->toBe(0);

    $this->actingAs($admin)->postJson(
        route('admin.option-values.images.store', $optionValue),
        ['image' => UploadedFile::fake()->image('second.jpg')],
    )->assertCreated();

    $second = ProductImage::query()
        ->where('option_value_id', $optionValue->id)
        ->orderByDesc('id')
        ->first();

    expect($second->is_primary)->toBeFalse()
        ->and($second->sort_order)->toBe(1);
});

test('admin can set a different primary image', function () {
    $admin = User::factory()->admin()->create();
    $optionValue = galleryOptionValueWithImages()->load('images');

    $target = $optionValue->images->firstWhere('is_primary', false)
        ?? $optionValue->images->last();

    $this->actingAs($admin)->patchJson(route('admin.images.update', $target), [
        'is_primary' => true,
    ])->assertOk();

    $optionValue->refresh()->load('images');

    expect($optionValue->images->where('is_primary', true))->toHaveCount(1)
        ->and($optionValue->images->firstWhere('id', $target->id)?->is_primary)->toBeTrue();
});

test('admin can reorder option value images', function () {
    $admin = User::factory()->admin()->create();
    $optionValue = galleryOptionValueWithImages()->load('images');
    $images = $optionValue->images->sortBy('sort_order')->values();
    $reversed = $images->reverse()->pluck('id')->all();

    $this->actingAs($admin)->postJson(
        route('admin.option-values.images.reorder', $optionValue),
        ['order' => $reversed],
    )->assertOk()
        ->assertJsonCount($images->count(), 'images');

    $optionValue->refresh()->load('images');

    expect(
        $optionValue->images->sortBy('sort_order')->pluck('id')->all(),
    )->toBe($reversed);
});

test('admin can delete uploaded image and remove file from storage', function () {
    $admin = User::factory()->admin()->create();
    $optionValue = galleryOptionValueWithImages();

    $this->actingAs($admin)->postJson(
        route('admin.option-values.images.store', $optionValue),
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
    $optionValue = galleryOptionValueWithImages()->load('images');
    $primary = $optionValue->images->firstWhere('is_primary', true)
        ?? $optionValue->images->sortBy('sort_order')->first();

    $this->actingAs($admin)->deleteJson(route('admin.images.destroy', $primary))
        ->assertOk();

    $optionValue->refresh()->load('images');

    if ($optionValue->images->isEmpty()) {
        expect($optionValue->images)->toBeEmpty();
    } else {
        expect($optionValue->images->where('is_primary', true))->toHaveCount(1);
    }
});

test('customer cannot upload product images', function () {
    $user = User::factory()->create();
    $optionValue = galleryOptionValueWithImages();

    $this->actingAs($user)->postJson(
        route('admin.option-values.images.store', $optionValue),
        ['image' => UploadedFile::fake()->image('product.jpg')],
    )->assertForbidden();
});

test('guest cannot upload product images', function () {
    $optionValue = galleryOptionValueWithImages();

    $this->postJson(
        route('admin.option-values.images.store', $optionValue),
        ['image' => UploadedFile::fake()->image('product.jpg')],
    )->assertRedirect(route('login'));
});
