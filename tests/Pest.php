<?php

use App\Models\Cart;
use App\Models\ProductVariant;
use App\Models\User;
use App\Support\CartSession;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function checkoutShippingPayload(): array
{
    return [
        'customerName' => 'Test Customer',
        'customerPhone' => '+84901234567',
        'shippingAddress' => '123 Nguyen Hue, District 1, Ho Chi Minh City',
    ];
}

function guestCheckoutPayload(): array
{
    return [
        ...checkoutShippingPayload(),
        'customerEmail' => 'guest@example.com',
    ];
}

function addVariantToGuestCart(
    mixed $test,
    ProductVariant $variant,
    int $quantity = 1,
): void {
    $test->postJson('/api/cart/items', [
        'variantId' => $variant->id,
        'quantity' => $quantity,
    ])->assertOk();
}

function withGuestCartCookie(mixed $test): mixed
{
    $sessionId = Cart::query()->value('session_id');

    return $test->withUnencryptedCookie(CartSession::COOKIE_NAME, $sessionId);
}

function addVariantToCart(
    mixed $test,
    User $user,
    ProductVariant $variant,
    int $quantity = 1,
): void {
    $test->actingAs($user)->postJson('/api/cart/items', [
        'variantId' => $variant->id,
        'quantity' => $quantity,
    ])->assertOk();
}
