<?php

use App\Models\AdminActivityLog;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('admin can export orders as csv', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $customer, $variant);
    $this->actingAs($customer)->post(route('checkout.store'), checkoutShippingPayload());

    $response = $this->actingAs($admin)->get(route('admin.orders.export'));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('text/csv');

    $content = $response->streamedContent();
    expect($content)->toContain('order_number')
        ->and($content)->toContain('payment_method')
        ->and($content)->toContain('refund_status');
});

test('order export creates activity log entry', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('admin.orders.export'))->assertOk();

    expect(AdminActivityLog::query()->where('action', 'orders.export')->count())->toBe(1);
});

test('admin can view activity log page', function () {
    $admin = User::factory()->admin()->create();

    AdminActivityLog::query()->create([
        'user_id' => $admin->id,
        'action' => 'orders.export',
        'created_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.activity-logs.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/activity-logs/index')
            ->has('logs.data', 1)
            ->where('logs.data.0.action', 'orders.export')
        );
});

test('guest can place checkout order with email', function () {
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToGuestCart($this, $variant);

    withGuestCartCookie($this)
        ->post(route('checkout.store'), guestCheckoutPayload())
        ->assertRedirect();

    $order = Order::query()->firstOrFail();
    expect($order->user_id)->toBeNull();

    $shipping = json_decode($order->shipping_address, true);
    expect($shipping['email'])->toBe('guest@example.com');
});

test('wishlist page is accessible to guests', function () {
    $this->get(route('wishlist.index'))->assertOk();
});

test('guest can access order lookup page', function () {
    $this->get(route('orders.lookup.create'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('storefront/orders/lookup'));
});

test('admin can access newsletter subscribers index', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.newsletter-subscribers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/newsletter-subscribers/index'));
});

test('customer cannot access newsletter subscribers admin page', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.newsletter-subscribers.index'))
        ->assertForbidden();
});
