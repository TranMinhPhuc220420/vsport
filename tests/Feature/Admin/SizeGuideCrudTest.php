<?php

use App\Models\Category;
use App\Models\SizeGuide;
use App\Models\SizeGuideRow;
use App\Models\User;
use Database\Seeders\BrandSeeder;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(BrandSeeder::class);
    $this->seed(CatalogSeeder::class);
});

test('admin can create update sync rows and delete a size guide', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::query()->where('slug', 'men-shoes')->firstOrFail();

    $this->actingAs($admin)
        ->post(route('admin.size-guides.store'), [
            'name' => 'Trail Shoes',
            'category_id' => $category->id,
            'is_default' => false,
        ])
        ->assertRedirect();

    $sizeGuide = SizeGuide::query()->where('name', 'Trail Shoes')->firstOrFail();

    expect($sizeGuide->columns)->toBe(['VN', 'US', 'UK', 'EU', 'CM']);

    $this->actingAs($admin)
        ->put(route('admin.size-guides.rows.sync', $sizeGuide), [
            'columns' => ['US', 'EU', 'CM'],
            'rows' => [
                ['position' => 0, 'values' => ['8', '41', '26']],
                ['position' => 1, 'values' => ['9', '42', '27']],
            ],
        ])
        ->assertRedirect();

    $sizeGuide->refresh();

    expect($sizeGuide->columns)->toBe(['US', 'EU', 'CM'])
        ->and($sizeGuide->rows)->toHaveCount(2);

    $row = $sizeGuide->rows->first();

    $this->actingAs($admin)
        ->put(route('admin.size-guides.rows.sync', $sizeGuide), [
            'columns' => ['US', 'EU', 'CM'],
            'rows' => [
                ['id' => $row->id, 'position' => 0, 'values' => ['8.5', '41.5', '26.5']],
            ],
        ])
        ->assertRedirect();

    expect($sizeGuide->fresh()->rows)->toHaveCount(1)
        ->and($sizeGuide->fresh()->rows->first()->values)->toBe(['8.5', '41.5', '26.5']);

    $this->actingAs($admin)
        ->put(route('admin.size-guides.update', $sizeGuide), [
            'name' => 'Trail Shoes Updated',
            'category_id' => $category->id,
            'is_default' => true,
        ])
        ->assertRedirect(route('admin.size-guides.index'));

    expect($sizeGuide->fresh()->name)->toBe('Trail Shoes Updated')
        ->and($sizeGuide->fresh()->is_default)->toBeTrue();

    $this->actingAs($admin)
        ->delete(route('admin.size-guides.destroy', $sizeGuide))
        ->assertRedirect(route('admin.size-guides.index'));

    $this->assertDatabaseMissing('size_guides', ['id' => $sizeGuide->id]);
    expect(SizeGuideRow::query()->where('size_guide_id', $sizeGuide->id)->count())->toBe(0);
});

test('admin can upload a size guide measure image', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();
    $sizeGuide = SizeGuide::query()->create([
        'name' => 'Measure Guide',
        'columns' => ['US', 'EU'],
        'is_default' => false,
    ]);

    $this->actingAs($admin)
        ->postJson(route('admin.size-guides.image.store', $sizeGuide), [
            'image' => UploadedFile::fake()->image('measure.jpg'),
            'image_alt' => 'How to measure foot',
        ])
        ->assertOk()
        ->assertJsonPath('sizeGuide.measureImageAlt', 'How to measure foot');

    $sizeGuide->refresh();

    expect($sizeGuide->measure_image_path)->not->toBeNull();
    Storage::disk('public')->assertExists($sizeGuide->measure_image_path);
});

test('customer cannot access admin size guide routes', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.size-guides.index'))
        ->assertForbidden();
});
