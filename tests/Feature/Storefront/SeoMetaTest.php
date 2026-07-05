<?php

use App\Models\Product;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('product detail page includes seo metadata', function () {
    $response = $this->get(route('products.show', 'jordan-1-low'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('storefront/products/show')
            ->has('seo')
            ->where('seo.title', fn ($title) => str_contains($title, 'Jordan'))
            ->where('seo.description', fn ($description) => is_string($description) && $description !== '')
            ->where('seo.canonical', route('products.show', 'jordan-1-low'))
            ->where('seo.ogType', 'product')
            ->where('seo.siteName', config('app.name'))
            ->has('structuredData', 2)
        );
});

test('product detail page renders seo metadata in html', function () {
    $response = $this->get(route('products.show', 'jordan-1-low'));

    $response->assertOk()
        ->assertSee('name="description"', false)
        ->assertSee('property="og:title"', false)
        ->assertSee('property="og:type" content="product"', false)
        ->assertSee('property="og:site_name"', false)
        ->assertSee('"@type":"Product"', false)
        ->assertSee('"@type":"BreadcrumbList"', false)
        ->assertSee('"@type":"Brand"', false)
        ->assertSee('"priceCurrency":"USD"', false);
});

test('category listing page includes seo metadata', function () {
    $this->get(route('category.show', 'men'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('seo')
            ->where('seo.canonical', route('category.show', 'men'))
            ->where('seo.siteName', config('app.name'))
            ->where('seo.ogImage', fn ($image) => is_string($image) && $image !== '')
        );
});

test('category listing page renders seo metadata in html', function () {
    $this->get(route('category.show', 'men'))
        ->assertOk()
        ->assertSee('name="description"', false)
        ->assertSee('rel="canonical"', false)
        ->assertSee('property="og:site_name"', false);
});

test('category listing page two uses noindex seo', function () {
    $this->get(route('category.show', ['category' => 'men', 'per_page' => 2, 'page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', 'noindex, follow')
            ->where('seo.canonical', route('category.show', 'men'))
        )
        ->assertSee('name="robots" content="noindex, follow"', false);
});

test('home page includes seo metadata and structured data', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('seo')
            ->where('seo.canonical', route('home'))
            ->where('seo.siteName', config('app.name'))
            ->has('structuredData', 2)
        );
});

test('home page renders seo metadata and organization schema in html', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertSee('name="description"', false)
        ->assertSee('property="og:url"', false)
        ->assertSee('property="og:site_name"', false)
        ->assertSee('name="twitter:card"', false)
        ->assertSee('"@type":"WebSite"', false)
        ->assertSee('"@type":"Organization"', false);
});

test('search with query uses noindex seo', function () {
    $product = Product::query()->firstOrFail();

    $this->get(route('search.index', ['q' => $product->name]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', 'noindex, follow')
            ->where('seo.canonical', route('search.index', ['q' => $product->name]))
        )
        ->assertSee('name="robots" content="noindex, follow"', false);
});

test('empty search page remains indexable', function () {
    $this->get(route('search.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', null)
            ->where('seo.canonical', route('search.index'))
        );
});

test('seeded product images expose alt text in api', function () {
    $response = $this->getJson('/api/products/jordan-1-low');

    $response->assertOk();

    $payload = $response->json('data') ?? $response->json();
    $options = $payload['options'] ?? [];

    $images = collect($options)->flatMap(
        fn (array $option) => collect($option['values'] ?? [])
            ->flatMap(fn (array $value) => $value['images'] ?? []),
    );

    expect($images)->not->toBeEmpty();

    $images->each(fn (array $image) => expect($image['alt'])->not->toBeEmpty());
});

test('cart and checkout pages use noindex seo', function () {
    $user = User::factory()->create();

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', 'noindex, nofollow'));

    $this->actingAs($user)
        ->get(route('checkout.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', 'noindex, nofollow'));
});

test('cart and checkout pages render noindex in html', function () {
    $user = User::factory()->create();

    $this->get(route('cart.index'))
        ->assertOk()
        ->assertSee('name="robots" content="noindex, nofollow"', false);

    $this->actingAs($user)
        ->get(route('checkout.create'))
        ->assertOk()
        ->assertSee('name="robots" content="noindex, nofollow"', false);
});

test('wishlist page uses noindex seo', function () {
    $this->get(route('wishlist.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('seo.robots', 'noindex, nofollow'))
        ->assertSee('name="robots" content="noindex, nofollow"', false);
});

test('sitemap includes public storefront urls', function () {
    $response = $this->get(route('sitemap'));

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/xml')
        ->assertSee(route('home'), false)
        ->assertSee(route('products.show', 'jordan-1-low'), false)
        ->assertSee(route('category.show', 'men'), false)
        ->assertSee(route('legal.privacy'), false);
});

test('robots.txt references sitemap and blocks private paths', function () {
    $response = $this->get('/robots.txt');

    $response->assertOk()
        ->assertSee('Sitemap: /sitemap.xml')
        ->assertSee('Disallow: /cart')
        ->assertSee('Disallow: /checkout')
        ->assertSee('Disallow: /admin')
        ->assertSee('Disallow: /orders/confirmation');
});
