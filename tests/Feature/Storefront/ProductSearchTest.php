<?php

use App\Mail\OrderConfirmationMail;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('product search returns matching products', function () {
    $product = Product::query()->firstOrFail();

    $this->get(route('search.index', ['q' => $product->name]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/products/search')
            ->where('query', $product->name)
            ->has('products.data', 1));

    $this->get(route('search.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('storefront/products/search')
            ->where('query', null)
            ->where('products', null));
});

test('cod checkout sends order confirmation email', function () {
    Mail::fake();

    $user = User::factory()->create();
    $variant = ProductVariant::query()->firstOrFail();

    addVariantToCart($this, $user, $variant);

    $this->actingAs($user)->post(
        route('checkout.store'),
        checkoutShippingPayload(),
    );

    Mail::assertSent(OrderConfirmationMail::class, function (OrderConfirmationMail $mail) use ($user) {
        return $mail->hasTo($user->email);
    });
});
