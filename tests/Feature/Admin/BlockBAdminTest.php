<?php

use App\Mail\OrderStatusUpdatedMail;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\Site\HomepageSettingsService;
use Database\Seeders\CatalogSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('admin can update homepage campaigns', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.homepage.update'), [
            'campaigns' => [
                [
                    'headline' => 'Summer Sale',
                    'subtitle' => 'Up to 30% off',
                    'imageUrl' => 'https://example.com/hero.jpg',
                    'ctaLabel' => 'Shop now',
                    'ctaHref' => '/women',
                ],
                [
                    'headline' => 'Winter Drop',
                    'subtitle' => 'New season',
                    'imageUrl' => 'https://example.com/hero-2.jpg',
                    'ctaLabel' => 'Explore',
                    'ctaHref' => '/men',
                ],
            ],
        ])
        ->assertRedirect(route('admin.homepage.edit'));

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('campaigns', 2)
            ->where('campaigns.0.headline', 'Summer Sale')
            ->where('campaigns.0.ctaHref', '/women')
            ->where('campaigns.1.headline', 'Winter Drop'));
});

test('admin can upload homepage hero image via method spoofed post', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.homepage.update'), [
            '_method' => 'put',
            'campaigns' => [
                [
                    'headline' => 'Trail Season',
                    'subtitle' => 'New arrivals',
                    'ctaLabel' => 'Shop now',
                    'ctaHref' => '/men',
                    'image' => UploadedFile::fake()->image('hero.jpg', 1440, 600),
                ],
                [
                    'headline' => 'Winter Drop',
                    'subtitle' => 'New season',
                    'imageUrl' => 'https://example.com/hero-2.jpg',
                    'ctaLabel' => 'Explore',
                    'ctaHref' => '/women',
                ],
            ],
        ])
        ->assertRedirect(route('admin.homepage.edit'));

    expect(app(HomepageSettingsService::class)->campaign()->imageUrl)
        ->toContain('/storage/homepage/');
});

test('admin homepage campaign upload shows helpful message when file exceeds php limit', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();
    $path = tempnam(sys_get_temp_dir(), 'hero');
    file_put_contents($path, str_repeat('x', 100));

    $file = new UploadedFile(
        $path,
        'hero.jpg',
        'image/jpeg',
        UPLOAD_ERR_INI_SIZE,
        true,
    );

    $this->actingAs($admin)
        ->put(route('admin.homepage.update'), [
            'campaigns' => [
                [
                    'headline' => 'Trail Season',
                    'subtitle' => 'New arrivals',
                    'ctaLabel' => 'Shop now',
                    'ctaHref' => '/men',
                    'image' => $file,
                ],
            ],
        ])
        ->assertSessionHasErrors([
            'campaigns.0.image' => __('messages.campaign_image_too_large'),
        ]);
});

test('admin can upload homepage hero image', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('admin.homepage.update'), [
            'campaigns' => [
                [
                    'headline' => 'Trail Season',
                    'subtitle' => 'New arrivals',
                    'ctaLabel' => 'Shop now',
                    'ctaHref' => '/men',
                    'image' => UploadedFile::fake()->image('hero.jpg', 1440, 600),
                ],
            ],
        ])
        ->assertRedirect(route('admin.homepage.edit'));

    $campaign = app(HomepageSettingsService::class)->campaign();

    expect($campaign->headline)->toBe('Trail Season')
        ->and($campaign->imageUrl)->toContain('/storage/homepage/');

    expect(Storage::disk('public')->files('homepage'))->not->toBeEmpty();
});

test('admin can toggle product featured status', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::query()->firstOrFail();

    expect($product->is_featured)->toBeFalse();

    $this->actingAs($admin)
        ->patch(route('admin.products.featured.update', $product), [
            'is_featured' => true,
        ])
        ->assertRedirect();

    expect($product->fresh()->is_featured)->toBeTrue();
});

test('featured products appear first on home page', function () {
    $admin = User::factory()->admin()->create();
    $products = Product::query()->orderBy('id')->limit(2)->get();
    $featured = $products->first();
    $other = $products->last();

    $this->actingAs($admin)->patch(
        route('admin.products.featured.update', $featured),
        ['is_featured' => true],
    );

    $response = $this->get(route('home'))->assertOk();

    $slugs = collect($response->original->getData()['page']['props']['featuredProducts']['data'])
        ->pluck('slug')
        ->all();

    expect($slugs[0])->toBe($featured->slug)
        ->and($slugs)->toContain($other->slug);
});

test('admin can filter and paginate reviews', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $product = Product::query()->firstOrFail();

    ProductReview::query()->create([
        'product_id' => $product->id,
        'user_id' => $user->id,
        'rating' => 5,
        'title' => 'Great',
        'body' => 'Love it',
        'is_approved' => false,
    ]);

    ProductReview::query()->create([
        'product_id' => $product->id,
        'user_id' => User::factory()->create()->id,
        'rating' => 4,
        'title' => 'Good',
        'body' => 'Nice',
        'is_approved' => true,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.reviews.index', ['status' => 'pending']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/reviews/index')
            ->has('reviews.data', 1)
            ->where('filters.status', 'pending'));

    $this->actingAs($admin)
        ->get(route('admin.reviews.index', ['status' => 'approved']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('reviews.data', 1));
});

test('admin analytics page is accessible', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.analytics.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/analytics/index'));
});

test('admin order status update sends email to customer', function () {
    Mail::fake();

    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $customer, $variant);
    $this->actingAs($customer)->post(route('checkout.store'), checkoutShippingPayload());

    $order = Order::query()->firstOrFail();

    $this->actingAs($admin)->patch(
        route('admin.orders.status.update', $order->order_number),
        ['status' => 'confirmed'],
    );

    Mail::assertSent(OrderStatusUpdatedMail::class, function (OrderStatusUpdatedMail $mail) use ($customer) {
        return $mail->hasTo($customer->email);
    });
});
