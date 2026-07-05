<?php

use App\Enums\BlogPostStatus;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use Database\Seeders\BlogSeeder;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
    $this->seed(BlogSeeder::class);
});

test('blog index lists published posts', function () {
    $this->get(route('blog.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/blog/index')
            ->has('posts.data', 8)
            ->has('categories')
            ->where('seo.canonical', route('blog.index')));
});

test('blog show renders published post by slug', function () {
    $post = BlogPost::query()->where('slug', 'cach-chon-size-giay-chay-dung')->firstOrFail();

    $this->get(route('blog.show', $post->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/blog/show')
            ->where('post.slug', $post->slug)
            ->has('relatedPosts')
            ->has('structuredData'));
});

test('draft blog posts are hidden from storefront', function () {
    $post = BlogPost::query()->where('slug', 'cach-chon-size-giay-chay-dung')->firstOrFail();
    $post->update([
        'status' => 'draft',
        'published_at' => null,
    ]);

    $this->get(route('blog.show', $post->slug))->assertNotFound();
});

test('blog index supports category filter', function () {
    $this->get(route('blog.index', ['category' => 'huong-dan']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/blog/index')
            ->where('filters.category', 'huong-dan')
            ->where('filters.tag', null)
            ->has('posts.data', 3));
});

test('blog index supports tag filter', function () {
    $post = BlogPost::query()->where('slug', 'cach-chon-size-giay-chay-dung')->firstOrFail();
    $tag = $post->tags()->first();

    expect($tag)->not->toBeNull();

    $this->get(route('blog.index', ['tag' => $tag->slug]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/blog/index')
            ->where('filters.tag', $tag->slug)
            ->where('activeTag.slug', $tag->slug)
            ->has('posts.data'));
});

test('scheduled blog posts are hidden from storefront', function () {
    $post = BlogPost::query()->where('slug', 'cach-chon-size-giay-chay-dung')->firstOrFail();
    $post->update([
        'status' => BlogPostStatus::Published,
        'published_at' => now()->addDay(),
    ]);

    $this->get(route('blog.show', $post->slug))->assertNotFound();
});

test('blog show returns not found for unknown slug', function () {
    $this->get(route('blog.show', 'does-not-exist'))->assertNotFound();
});

test('blog show related posts share category or tags and exclude self', function () {
    $category = BlogCategory::factory()->create();
    $post = BlogPost::factory()->published()->create([
        'blog_category_id' => $category->id,
        'slug' => 'main-related-post',
    ]);
    $related = BlogPost::factory()->published()->create([
        'blog_category_id' => $category->id,
        'slug' => 'related-sibling-post',
    ]);

    $response = $this->get(route('blog.show', $post->slug));

    $relatedSlugs = collect(
        $response->original->getData()['page']['props']['relatedPosts'],
    )->pluck('slug');

    expect($relatedSlugs)->not->toContain($post->slug)
        ->and($relatedSlugs)->toContain($related->slug);
});

test('blog index pagination returns correct page meta', function () {
    $this->get(route('blog.index', ['page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/blog/index')
            ->where('posts.meta.current_page', 2));
});
