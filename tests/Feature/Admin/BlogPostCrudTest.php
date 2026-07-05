<?php

use App\Enums\BlogPostStatus;
use App\Models\BlogCategory;
use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('public');
    $this->seed(CatalogSeeder::class);
});

test('admin can create update and delete blog posts', function () {
    $admin = User::factory()->admin()->create();
    $category = BlogCategory::factory()->create();
    $tag = BlogTag::factory()->create();

    $createResponse = $this->actingAs($admin)->post(route('admin.blog-posts.store'), [
        'title' => 'Test Blog Post',
        'slug' => 'test-blog-post',
        'excerpt' => 'Short excerpt for the blog post.',
        'bodyHtml' => '<p>Hello <strong>world</strong></p>',
        'blogCategoryId' => $category->id,
        'tagIds' => [$tag->id],
        'productIds' => [],
        'status' => BlogPostStatus::Draft->value,
        'isFeatured' => false,
    ]);

    $post = BlogPost::query()->where('slug', 'test-blog-post')->firstOrFail();

    $createResponse->assertRedirect(route('admin.blog-posts.edit', $post));

    expect($post->title)->toBe('Test Blog Post')
        ->and($post->body_html)->toBe('<p>Hello <strong>world</strong></p>')
        ->and($post->tags)->toHaveCount(1);

    $this->actingAs($admin)->put(route('admin.blog-posts.update', $post), [
        'title' => 'Updated Blog Post',
        'slug' => 'test-blog-post',
        'excerpt' => 'Updated excerpt for the blog post.',
        'bodyHtml' => '<p>Updated content</p>',
        'blogCategoryId' => $category->id,
        'tagIds' => [$tag->id],
        'productIds' => [],
        'status' => BlogPostStatus::Published->value,
        'isFeatured' => true,
        'publishedAt' => now()->toIso8601String(),
    ])->assertRedirect(route('admin.blog-posts.edit', $post));

    $post->refresh();

    expect($post->title)->toBe('Updated Blog Post')
        ->and($post->status)->toBe(BlogPostStatus::Published)
        ->and($post->is_featured)->toBeTrue();

    $this->actingAs($admin)->delete(route('admin.blog-posts.destroy', $post))
        ->assertRedirect(route('admin.blog-posts.index'));

    expect(BlogPost::query()->whereKey($post->id)->exists())->toBeFalse();
});

test('admin can open blog post edit page by slug', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->create(['slug' => 'editable-blog-post']);

    $this->actingAs($admin)
        ->get(route('admin.blog-posts.edit', $post))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/blog-posts/edit')
            ->where('post.slug', 'editable-blog-post')
        );
});

test('admin blog posts index includes visual list fields', function () {
    $admin = User::factory()->admin()->create();
    $category = BlogCategory::factory()->create(['name' => 'Guides']);

    $post = BlogPost::factory()->published()->create([
        'title' => 'Visual List Post',
        'slug' => 'visual-list-post',
        'excerpt' => 'A short excerpt for the admin list.',
        'author_name' => 'Editor One',
        'reading_time_minutes' => 5,
        'blog_category_id' => $category->id,
        'featured_image_path' => 'blog/featured/test.jpg',
        'featured_image_url' => '/storage/blog/featured/test.jpg',
        'featured_image_alt' => 'Featured image alt',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.blog-posts.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/blog-posts/index')
            ->has('posts.data', 1)
            ->where('posts.data.0.id', $post->id)
            ->where('posts.data.0.title', 'Visual List Post')
            ->where('posts.data.0.excerpt', 'A short excerpt for the admin list.')
            ->where('posts.data.0.authorName', 'Editor One')
            ->where('posts.data.0.readingTimeMinutes', 5)
            ->where('posts.data.0.categoryName', 'Guides')
            ->where('posts.data.0.featuredImageAlt', 'Featured image alt')
            ->where('posts.data.0.featuredImageUrl', '/storage/blog/featured/test.jpg')
        );
});

test('admin blog post edit page returns not found for numeric id url', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->create(['slug' => 'real-slug']);

    $this->actingAs($admin)
        ->get("/admin/blog-posts/{$post->id}/edit")
        ->assertNotFound();
});

test('blog post store returns readable validation errors', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->withCookie('locale', 'vi')
        ->post(route('admin.blog-posts.store'), [
            'title' => '',
            'excerpt' => '',
            'status' => 'invalid',
        ]);

    $response->assertSessionHasErrors(['title', 'excerpt', 'status']);

    $errors = session('errors')->getBag('default');

    expect($errors->first('title'))
        ->toContain('tiêu đề')
        ->and($errors->first('excerpt'))
        ->toContain('tóm tắt');
});

test('admin can upload blog featured image', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->create();

    $this->actingAs($admin)->post(route('admin.blog-posts.featured-image.store', $post), [
        'image' => UploadedFile::fake()->image('featured.jpg', 1200, 675),
        'image_alt' => 'Featured alt text',
    ])->assertOk()
        ->assertJsonPath('post.featuredImageAlt', 'Featured alt text');

    $post->refresh();

    expect($post->featured_image_path)->not->toBeNull()
        ->and($post->featured_image_url)->not->toBeNull();

    $this->actingAs($admin)->delete(route('admin.blog-posts.featured-image.destroy', $post))
        ->assertNoContent();

    $post->refresh();

    expect($post->featured_image_path)->toBeNull();
});

test('admin can create blog post with linked products', function () {
    $admin = User::factory()->admin()->create();
    $category = BlogCategory::factory()->create();
    $product = Product::query()->firstOrFail();

    $this->actingAs($admin)->post(route('admin.blog-posts.store'), [
        'title' => 'Product Linked Post',
        'slug' => 'product-linked-post',
        'excerpt' => 'Post excerpt with product links.',
        'bodyHtml' => '<p>Content with products</p>',
        'blogCategoryId' => $category->id,
        'tagIds' => [],
        'productIds' => [$product->id],
        'status' => BlogPostStatus::Published->value,
        'isFeatured' => false,
        'publishedAt' => now()->toIso8601String(),
    ])->assertRedirect();

    $post = BlogPost::query()->where('slug', 'product-linked-post')->firstOrFail();

    expect($post->products)->toHaveCount(1)
        ->and($post->products->first()->id)->toBe($product->id);

    $this->get(route('blog.show', $post->slug))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('post.products', 1)
            ->where('post.products.0.slug', $product->slug)
        );
});

test('blog post auto generates slug from title when omitted', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.blog-posts.store'), [
        'title' => 'Auto Slug Post Title',
        'excerpt' => 'Excerpt for auto slug post.',
        'bodyHtml' => '<p>Body</p>',
        'tagIds' => [],
        'productIds' => [],
        'status' => BlogPostStatus::Draft->value,
        'isFeatured' => false,
    ])->assertRedirect();

    expect(BlogPost::query()->where('slug', 'auto-slug-post-title')->exists())->toBeTrue();
});

test('blog post resolves duplicate slug with numeric suffix when slug omitted', function () {
    $admin = User::factory()->admin()->create();
    BlogPost::factory()->create(['slug' => 'duplicate-slug', 'title' => 'Duplicate Slug']);

    $this->actingAs($admin)->post(route('admin.blog-posts.store'), [
        'title' => 'Duplicate Slug',
        'excerpt' => 'Another post with the same generated slug.',
        'bodyHtml' => '<p>Body</p>',
        'tagIds' => [],
        'productIds' => [],
        'status' => BlogPostStatus::Draft->value,
        'isFeatured' => false,
    ])->assertRedirect();

    expect(BlogPost::query()->where('slug', 'duplicate-slug-1')->exists())->toBeTrue();
});

test('publishing blog post without published at sets published at to now', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->create(['published_at' => null]);

    $this->actingAs($admin)->put(route('admin.blog-posts.update', $post), [
        'title' => $post->title,
        'slug' => $post->slug,
        'excerpt' => $post->excerpt,
        'bodyHtml' => $post->body_html,
        'tagIds' => [],
        'productIds' => [],
        'status' => BlogPostStatus::Published->value,
        'isFeatured' => false,
    ])->assertRedirect();

    $post->refresh();

    expect($post->status)->toBe(BlogPostStatus::Published)
        ->and($post->published_at)->not->toBeNull();
});

test('reverting blog post to draft clears published at', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->published()->create();

    $this->actingAs($admin)->put(route('admin.blog-posts.update', $post), [
        'title' => $post->title,
        'slug' => $post->slug,
        'excerpt' => $post->excerpt,
        'bodyHtml' => $post->body_html,
        'tagIds' => [],
        'productIds' => [],
        'status' => BlogPostStatus::Draft->value,
        'isFeatured' => false,
    ])->assertRedirect();

    $post->refresh();

    expect($post->status)->toBe(BlogPostStatus::Draft)
        ->and($post->published_at)->toBeNull();
});

test('blog featured image upload rejects non image files', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->create();

    $this->actingAs($admin)->post(route('admin.blog-posts.featured-image.store', $post), [
        'image' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        'image_alt' => 'Invalid file',
    ])->assertSessionHasErrors('image');
});

test('blog featured image upload requires image field', function () {
    $admin = User::factory()->admin()->create();
    $post = BlogPost::factory()->create();

    $this->actingAs($admin)->post(route('admin.blog-posts.featured-image.store', $post), [
        'image_alt' => 'Missing image',
    ])->assertSessionHasErrors('image');
});

test('admin can manage blog categories and tags', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('admin.blog-categories.store'), [
        'name' => 'Guides',
        'slug' => 'guides',
        'description' => 'How-to articles',
        'sortOrder' => 1,
    ])->assertRedirect(route('admin.blog-categories.index'));

    $category = BlogCategory::query()->where('slug', 'guides')->firstOrFail();

    $this->actingAs($admin)->post(route('admin.blog-tags.store'), [
        'name' => 'Running',
        'slug' => 'running',
    ])->assertRedirect(route('admin.blog-tags.index'));

    $tag = BlogTag::query()->where('slug', 'running')->firstOrFail();

    expect($category->name)->toBe('Guides')
        ->and($tag->name)->toBe('Running');

    $this->actingAs($admin)
        ->get(route('admin.blog-categories.edit', $category))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/blog-categories/edit')
            ->where('category.slug', 'guides')
        );

    $this->actingAs($admin)
        ->get(route('admin.blog-tags.edit', $tag))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/blog-tags/edit')
            ->where('tag.slug', 'running')
        );
});
