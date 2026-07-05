<?php

use App\Enums\BlogPostStatus;
use App\Models\BlogPost;
use App\Models\Product;
use App\Services\Blog\BlogPostService;
use Database\Seeders\CatalogSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
    $this->service = app(BlogPostService::class);
});

test('create calculates reading time minutes from body html', function () {
    $body = '<p>'.implode(' ', array_fill(0, 400, 'word')).'</p>';

    $post = $this->service->create([
        'title' => 'Reading Time Post',
        'excerpt' => 'Excerpt for reading time.',
        'body_html' => $body,
        'status' => BlogPostStatus::Draft,
    ]);

    expect($post->reading_time_minutes)->toBeGreaterThanOrEqual(2);
});

test('create extracts plain body text from body html', function () {
    $post = $this->service->create([
        'title' => 'Plain Body Post',
        'excerpt' => 'Excerpt for plain body.',
        'body_html' => '<p>Hello <strong>world</strong></p>',
        'status' => BlogPostStatus::Draft,
    ]);

    expect($post->body_html)->toBe('<p>Hello <strong>world</strong></p>')
        ->and($post->body)->toBe('Hello world');
});

test('create syncs at most three linked products', function () {
    $products = Product::query()->limit(4)->pluck('id')->all();

    $post = $this->service->create([
        'title' => 'Product Sync Post',
        'excerpt' => 'Excerpt for product sync.',
        'body_html' => '<p>Products</p>',
        'status' => BlogPostStatus::Draft,
    ], [], $products);

    expect($post->products)->toHaveCount(3);
});

test('publish without published at assigns current timestamp', function () {
    $post = $this->service->create([
        'title' => 'Publish Now Post',
        'excerpt' => 'Excerpt for publish now.',
        'body_html' => '<p>Publish</p>',
        'status' => BlogPostStatus::Published,
        'published_at' => null,
    ]);

    expect($post->published_at)->not->toBeNull();
});

test('draft status clears published at on update', function () {
    $post = BlogPost::factory()->published()->create();

    $updated = $this->service->update($post, [
        'title' => $post->title,
        'slug' => $post->slug,
        'excerpt' => $post->excerpt,
        'body_html' => $post->body_html,
        'status' => BlogPostStatus::Draft,
    ]);

    expect($updated->published_at)->toBeNull();
});
