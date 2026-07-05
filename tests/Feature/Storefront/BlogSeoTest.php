<?php

use App\Enums\BlogPostStatus;
use App\Models\BlogPost;
use Database\Seeders\BlogSeeder;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
    $this->seed(BlogSeeder::class);
});

test('blog index exposes seo metadata in inertia and html', function () {
    $this->get(route('blog.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/blog/index')
            ->has('seo')
            ->where('seo.canonical', route('blog.index'))
            ->where('seo.siteName', config('app.name'))
            ->where('seo.rssAlternateUrl', route('blog.feed'))
            ->where('seo.ogImage', fn ($image) => is_string($image) && $image !== '')
        )
        ->assertSee('name="description"', false)
        ->assertSee('property="og:site_name"', false)
        ->assertSee('rel="alternate" type="application/rss+xml"', false);
});

test('blog post exposes seo metadata and structured data', function () {
    $slug = 'cach-chon-size-giay-chay-dung';

    $this->get(route('blog.show', $slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/blog/show')
            ->has('seo')
            ->where('seo.canonical', route('blog.show', $slug))
            ->where('seo.ogType', 'article')
            ->where('seo.articleAuthor', fn ($author) => is_string($author) && $author !== '')
            ->where('seo.articlePublishedTime', fn ($time) => is_string($time) && $time !== '')
            ->has('structuredData', 2)
        );
});

test('blog post renders article seo metadata and json-ld in html', function () {
    $slug = 'cach-chon-size-giay-chay-dung';

    $this->get(route('blog.show', $slug))
        ->assertOk()
        ->assertSee('Cách chọn size giày chạy đúng', false)
        ->assertSee('property="og:type" content="article"', false)
        ->assertSee('property="article:published_time"', false)
        ->assertSee('property="article:author"', false)
        ->assertSee('"@type":"BlogPosting"', false)
        ->assertSee('"@type":"BreadcrumbList"', false)
        ->assertSee('rel="alternate" type="application/rss+xml"', false);
});

test('blog category filter uses dedicated seo canonical', function () {
    $this->get(route('blog.index', ['category' => 'huong-dan']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.canonical', route('blog.index', ['category' => 'huong-dan']))
            ->where('seo.title', fn ($title) => str_contains($title, 'Hướng dẫn'))
        );
});

test('blog tag filter uses dedicated seo canonical', function () {
    $this->get(route('blog.index', ['tag' => 'giay-chay']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.canonical', route('blog.index', ['tag' => 'giay-chay']))
            ->where('seo.title', fn ($title) => str_contains($title, 'Giày chạy'))
        );
});

test('blog index page two uses noindex seo', function () {
    $this->get(route('blog.index', ['page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', 'noindex, follow')
            ->where('seo.canonical', route('blog.index'))
        )
        ->assertSee('name="robots" content="noindex, follow"', false);
});

test('sitemap includes blog urls', function () {
    $response = $this->get(route('sitemap'));

    $response->assertOk()
        ->assertSee(route('blog.index'), false)
        ->assertSee(route('blog.show', 'cach-chon-size-giay-chay-dung'), false);
});

test('blog rss feed returns valid localized xml', function () {
    $response = $this->get(route('blog.feed'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/rss+xml; charset=UTF-8')
        ->assertSee('<rss version="2.0"', false)
        ->assertSee('<language>vi</language>', false)
        ->assertSee('Cách chọn size giày chạy đúng', false);
});

test('blog rss feed respects locale cookie', function () {
    $response = $this->withUnencryptedCookie('locale', 'en')
        ->get(route('blog.feed'));

    $response->assertOk()
        ->assertSee('<language>en</language>', false)
        ->assertSee('News', false);
});

test('draft blog posts are excluded from rss feed', function () {
    BlogPost::factory()->create([
        'title' => 'Draft RSS Post',
        'slug' => 'draft-rss-post',
        'status' => BlogPostStatus::Draft,
        'published_at' => null,
    ]);

    $this->get(route('blog.feed'))
        ->assertOk()
        ->assertDontSee('Draft RSS Post', false);
});

test('scheduled blog posts are excluded from rss feed', function () {
    BlogPost::factory()->create([
        'title' => 'Scheduled RSS Post',
        'slug' => 'scheduled-rss-post',
        'status' => BlogPostStatus::Published,
        'published_at' => now()->addWeek(),
    ]);

    $this->get(route('blog.feed'))
        ->assertOk()
        ->assertDontSee('Scheduled RSS Post', false);
});

test('draft blog posts are excluded from sitemap', function () {
    BlogPost::factory()->create([
        'title' => 'Draft Sitemap Post',
        'slug' => 'draft-sitemap-post',
        'status' => BlogPostStatus::Draft,
        'published_at' => null,
    ]);

    $this->get(route('sitemap'))
        ->assertOk()
        ->assertDontSee(route('blog.show', 'draft-sitemap-post'), false);
});

test('blog post uses custom meta title and description in seo', function () {
    $post = BlogPost::query()->where('slug', 'cach-chon-size-giay-chay-dung')->firstOrFail();
    $post->update([
        'meta_title' => 'Custom Meta Title',
        'meta_description' => 'Custom meta description for search engines.',
    ]);

    $this->get(route('blog.show', $post->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.title', fn ($title) => str_contains($title, 'Custom Meta Title'))
            ->where('seo.description', 'Custom meta description for search engines.')
        );
});

test('rss feed only includes published posts with past published_at', function () {
    BlogPost::factory()->published()->create([
        'title' => 'Visible RSS Post',
        'slug' => 'visible-rss-post',
        'published_at' => now()->subHour(),
    ]);

    BlogPost::factory()->create([
        'title' => 'Future RSS Post',
        'slug' => 'future-rss-post',
        'status' => BlogPostStatus::Published,
        'published_at' => now()->addDay(),
    ]);

    $response = $this->get(route('blog.feed'));

    $response->assertOk()
        ->assertSee('Visible RSS Post', false)
        ->assertDontSee('Future RSS Post', false);
});
