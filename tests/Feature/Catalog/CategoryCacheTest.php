<?php

use App\Models\Category;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('storefront reflects category updates after cache invalidation', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::query()->where('slug', 'men')->firstOrFail();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories.data', fn ($categories) => collect($categories)->firstWhere('slug', 'men')['name'] === 'Men')
        );

    $this->actingAs($admin)->put(route('admin.categories.update', $category), [
        'name' => 'Menswear',
        'slug' => 'men',
        'parent_id' => null,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('categories.data', fn ($categories) => collect($categories)->firstWhere('slug', 'men')['name'] === 'Menswear')
        );
});
