<?php

use App\Models\Product;
use App\Models\ProductContentSection;
use App\Models\ProductContentSectionImage;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('public');
    $this->seed(CatalogSeeder::class);
});

test('admin can sync product content sections', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->firstOrFail();

    $this->actingAs($admin)->put(route('admin.products.content-sections.sync', $product), [
        'sections' => [
            [
                'title' => 'Behind the Product',
                'content_html' => '<p>Story with <strong>details</strong></p>',
                'sortOrder' => 0,
            ],
            [
                'title' => 'Tech Specs',
                'content_html' => '<p>Weight: 8 oz</p>',
                'sortOrder' => 1,
            ],
        ],
    ])->assertRedirect(route('admin.products.edit', ['product' => $product, 'tab' => 'content']));

    $sections = ProductContentSection::query()
        ->where('product_id', $product->id)
        ->orderBy('sort_order')
        ->get();

    expect($sections)->toHaveCount(2)
        ->and($sections[0]->title)->toBe('Behind the Product')
        ->and($sections[0]->content_html)->toBe('<p>Story with <strong>details</strong></p>')
        ->and($sections[0]->content)->toBe('Story with details')
        ->and($sections[1]->title)->toBe('Tech Specs');
});

test('syncing content sections upserts by id and removes missing rows', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->firstOrFail();

    $existing = ProductContentSection::query()->create([
        'product_id' => $product->id,
        'title' => 'Old section',
        'content_html' => '<p>Old</p>',
        'content' => 'Old',
        'sort_order' => 0,
    ]);

    $this->actingAs($admin)->put(route('admin.products.content-sections.sync', $product), [
        'sections' => [
            [
                'id' => $existing->id,
                'title' => 'Updated section',
                'content_html' => '<p>Updated</p>',
                'sortOrder' => 0,
            ],
            [
                'title' => 'New section',
                'content_html' => '<p>New</p>',
                'sortOrder' => 1,
            ],
        ],
    ])->assertRedirect();

    $sections = ProductContentSection::query()
        ->where('product_id', $product->id)
        ->orderBy('sort_order')
        ->get();

    expect($sections)->toHaveCount(2)
        ->and($sections[0]->id)->toBe($existing->id)
        ->and($sections[0]->title)->toBe('Updated section')
        ->and($sections[1]->title)->toBe('New section');
});

test('admin can upload image for a content section', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->firstOrFail();

    $section = ProductContentSection::query()->create([
        'product_id' => $product->id,
        'title' => 'Product Features',
        'content_html' => '<p>Features</p>',
        'content' => 'Features',
        'sort_order' => 0,
    ]);

    $file = UploadedFile::fake()->image('feature.jpg', 800, 1000);

    $this->actingAs($admin)
        ->post(route('admin.content-sections.images.store', $section), [
            'image' => $file,
            'image_alt_tag' => 'Feature image',
        ])
        ->assertCreated()
        ->assertJsonPath('image.alt', 'Feature image');

    $image = ProductContentSectionImage::query()->firstOrFail();

    expect($image->content_section_id)->toBe($section->id)
        ->and($image->storage_path)->toStartWith('content-sections/'.$section->id.'/');
});

test('product detail page exposes content sections with images in inertia props', function () {
    $product = Product::query()->firstOrFail();

    $section = ProductContentSection::query()->create([
        'product_id' => $product->id,
        'title' => 'Product Features',
        'content_html' => '<p>Feature <em>copy</em></p>',
        'content' => 'Feature copy',
        'sort_order' => 0,
    ]);

    ProductContentSectionImage::query()->create([
        'content_section_id' => $section->id,
        'image_url' => '/storage/content-sections/demo.jpg',
        'storage_path' => 'content-sections/demo.jpg',
        'image_alt_tag' => 'Demo',
        'sort_order' => 0,
    ]);

    $this->get(route('products.show', $product->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/products/show')
            ->has('product.contentSections', 1)
            ->where('product.contentSections.0.title', 'Product Features')
            ->where('product.contentSections.0.contentHtml', '<p>Feature <em>copy</em></p>')
            ->has('product.contentSections.0.images', 1)
            ->where('product.contentSections.0.images.0.alt', 'Demo'));
});

test('sync rejects content section without title', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->firstOrFail();

    $this->actingAs($admin)->put(route('admin.products.content-sections.sync', $product), [
        'sections' => [
            [
                'title' => '',
                'content_html' => '<p>Missing title</p>',
            ],
        ],
    ])->assertSessionHasErrors('sections.0.title');
});
