<?php

use App\Enums\BlogPostStatus;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Services\Blog\BlogCatalogService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(BlogCatalogService::class);
});

test('featured for homepage only returns featured published posts', function () {
    $featured = BlogPost::factory()->published()->featured()->create([
        'title' => 'Featured Post',
        'slug' => 'featured-post',
    ]);

    BlogPost::factory()->published()->create([
        'title' => 'Regular Post',
        'slug' => 'regular-post',
        'is_featured' => false,
    ]);

    $results = $this->service->featuredForHomepage();

    expect($results->pluck('slug')->all())->toBe([$featured->slug]);
});

test('related posts prefer same category or shared tags and exclude self', function () {
    $category = BlogCategory::factory()->create();
    $tag = BlogTag::factory()->create();

    $post = BlogPost::factory()->published()->create([
        'blog_category_id' => $category->id,
        'slug' => 'main-post',
    ]);
    $post->tags()->attach($tag);

    $sameCategory = BlogPost::factory()->published()->create([
        'blog_category_id' => $category->id,
        'slug' => 'same-category-post',
    ]);

    BlogPost::factory()->published()->create([
        'slug' => 'unrelated-post',
    ]);

    $related = $this->service->relatedPosts($post->fresh(['category', 'tags']));

    expect($related->pluck('slug')->all())->toContain('same-category-post')
        ->and($related->pluck('slug')->all())->not->toContain('main-post')
        ->and($related->pluck('slug')->all())->not->toContain('unrelated-post');
});

test('latest for feed returns published posts ordered by published at desc', function () {
    $older = BlogPost::factory()->published()->create([
        'slug' => 'older-feed-post',
        'published_at' => now()->subDays(2),
    ]);

    $newer = BlogPost::factory()->published()->create([
        'slug' => 'newer-feed-post',
        'published_at' => now()->subDay(),
    ]);

    BlogPost::factory()->create([
        'slug' => 'draft-feed-post',
        'status' => BlogPostStatus::Draft,
        'published_at' => null,
    ]);

    $results = $this->service->latestForFeed();

    expect($results->first()->slug)->toBe($newer->slug)
        ->and($results->pluck('slug')->all())->toContain($older->slug)
        ->and($results->pluck('slug')->all())->not->toContain('draft-feed-post')
        ->and($results)->toHaveCount(2);
});

test('latest for feed limits results to twenty posts', function () {
    BlogPost::factory()->published()->count(25)->create();

    expect($this->service->latestForFeed())->toHaveCount(20);
});
