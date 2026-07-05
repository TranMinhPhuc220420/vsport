<?php

use App\Models\BlogPost;
use App\Models\BlogTag;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('admin blog tags index lists tags with posts count', function () {
    $admin = User::factory()->admin()->create();
    $tag = BlogTag::factory()->create(['name' => 'Running', 'slug' => 'running']);
    $post = BlogPost::factory()->create();
    $post->tags()->attach($tag);

    $this->actingAs($admin)
        ->get(route('admin.blog-tags.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/blog-tags/index')
            ->has('tags.data', 1)
            ->where('tags.data.0.slug', 'running')
            ->where('tags.data.0.postsCount', 1)
        );
});

test('admin can update blog tag', function () {
    $admin = User::factory()->admin()->create();
    $tag = BlogTag::factory()->create([
        'name' => 'Running',
        'slug' => 'running',
    ]);

    $this->actingAs($admin)->put(route('admin.blog-tags.update', $tag), [
        'name' => 'Trail Running',
        'slug' => 'trail-running',
    ])->assertRedirect(route('admin.blog-tags.index'));

    $tag->refresh();

    expect($tag->name)->toBe('Trail Running')
        ->and($tag->slug)->toBe('trail-running');
});

test('admin can delete blog tag and detach posts', function () {
    $admin = User::factory()->admin()->create();
    $tag = BlogTag::factory()->create();
    $post = BlogPost::factory()->create();
    $post->tags()->attach($tag);

    $this->actingAs($admin)
        ->delete(route('admin.blog-tags.destroy', $tag))
        ->assertRedirect(route('admin.blog-tags.index'));

    expect(BlogTag::query()->whereKey($tag->id)->exists())->toBeFalse()
        ->and($post->fresh()->tags)->toHaveCount(0);
});
