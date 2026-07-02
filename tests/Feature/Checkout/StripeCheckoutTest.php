<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\Payment\StripeCheckoutService;
use Database\Seeders\CatalogSeeder;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
    config([
        'services.stripe.secret' => 'sk_test_fake',
        'services.stripe.key' => 'pk_test_fake',
        'services.stripe.webhook_secret' => 'whsec_test',
    ]);
});

test('stripe checkout creates order with payment method stripe', function () {
    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $user, $variant);

    $this->mock(StripeCheckoutService::class, function ($mock): void {
        $mock->shouldReceive('createPaymentIntent')
            ->once()
            ->andReturn([
                'paymentIntentId' => 'pi_test_123',
                'clientSecret' => 'pi_test_123_secret',
            ]);
    });

    $response = $this->actingAs($user)->post(route('checkout.store'), [
        ...checkoutShippingPayload(),
        'paymentMethod' => 'stripe',
    ]);

    $order = Order::query()->firstOrFail();

    expect($order->payment_method)->toBe(PaymentMethod::Stripe)
        ->and($order->status)->toBe(OrderStatus::Pending);

    $response->assertInertia(fn ($page) => $page->component('storefront/checkout-stripe'));
});

test('stripe webhook is idempotent for payment success', function () {
    $order = Order::factory()->create([
        'payment_intent_id' => 'pi_test_webhook',
        'payment_method' => PaymentMethod::Stripe,
        'status' => OrderStatus::Pending,
    ]);

    $payload = json_encode([
        'id' => 'evt_test',
        'type' => 'payment_intent.succeeded',
        'data' => [
            'object' => [
                'id' => 'pi_test_webhook',
            ],
        ],
    ], JSON_THROW_ON_ERROR);

    $this->postJson(route('stripe.webhook'), [], [
        'Stripe-Signature' => 'invalid',
    ])->assertStatus(400);
});
