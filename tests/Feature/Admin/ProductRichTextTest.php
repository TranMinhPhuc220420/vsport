<?php

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Support\RichTextHtml;
use Database\Seeders\CatalogSeeder;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    $this->seed(CatalogSeeder::class);
});

function adminProductPayload(array $overrides = []): array
{
    $category = Category::query()->firstOrFail();

    return array_merge([
        'style_code' => 'RT-'.uniqid(),
        'name' => 'Rich Text Product',
        'slug' => 'rich-text-'.uniqid(),
        'description' => '',
        'description_html' => '<p><strong>Hello</strong> world</p>',
        'category_id' => $category->id,
        'sub_title' => 'Subtitle',
        'base_price' => '99.99',
        'gender' => 'Unisex',
        'is_customizable' => false,
    ], $overrides);
}

test('admin can store product with description_html and derived plain description', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post(route('admin.products.store'), adminProductPayload());

    $response->assertRedirect();

    $product = Product::query()->where('name', 'Rich Text Product')->firstOrFail();

    expect($product->description_html)->toBe('<p><strong>Hello</strong> world</p>')
        ->and($product->description)->toBe('Hello world');
});

test('admin can update product description_html and re-derive plain description', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->firstOrFail();

    $this->actingAs($admin)->put(route('admin.products.update', $product), [
        'style_code' => $product->style_code,
        'name' => $product->name,
        'slug' => $product->slug,
        'description' => $product->description ?? '',
        'description_html' => '<p>Updated <em>copy</em></p>',
        'category_id' => $product->category_id,
        'sub_title' => $product->sub_title,
        'base_price' => (string) $product->base_price,
        'gender' => $product->gender->value,
        'is_customizable' => $product->is_customizable,
    ])->assertRedirect();

    $product->refresh();

    expect($product->description_html)->toBe('<p>Updated <em>copy</em></p>')
        ->and($product->description)->toBe('Updated copy');
});

test('store rejects description_html longer than text column limit', function () {
    $admin = User::factory()->admin()->create();
    $html = '<p>'.str_repeat('x', RichTextHtml::MAX_LENGTH).'</p>';

    $this->actingAs($admin)->post(route('admin.products.store'), adminProductPayload([
        'description_html' => $html,
    ]))->assertSessionHasErrors('description_html');

    expect(Product::query()->where('name', 'Rich Text Product')->exists())->toBeFalse();
});

test('store externalizes base64 images in description_html', function () {
    $admin = User::factory()->admin()->create();
    $png = base64_encode(hex2bin(
        '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489'.
        '0000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082'
    ));

    $html = '<p>Image</p><img src="data:image/png;base64,'.$png.'" alt="test">';

    $this->actingAs($admin)->post(route('admin.products.store'), adminProductPayload([
        'description_html' => $html,
    ]))->assertRedirect();

    $product = Product::query()->where('name', 'Rich Text Product')->firstOrFail();
    $stored = (string) $product->description_html;

    expect($stored)->not->toContain('data:image')
        ->and($stored)->toContain('/storage/richtext/');
});
