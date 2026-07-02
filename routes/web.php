<?php

use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Storefront\AccountController;
use App\Http\Controllers\Storefront\CartController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\HomeController;
use App\Http\Controllers\Storefront\LegalController;
use App\Http\Controllers\Storefront\OrderConfirmationController;
use App\Http\Controllers\Storefront\OrderHistoryController;
use App\Http\Controllers\Storefront\ProductDetailController;
use App\Http\Controllers\Storefront\ProductListingController;
use App\Http\Controllers\Storefront\ProductReviewController;
use App\Http\Controllers\Storefront\ProductSearchController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::inertia('/preview/design-system', 'preview/design-system')
    ->middleware('local')
    ->name('preview.design-system');

Route::get('/cart', [CartController::class, 'index'])->name('cart.index');

Route::get('/search', [ProductSearchController::class, 'index'])->name('search.index');

Route::get('/privacy', [LegalController::class, 'privacy'])->name('legal.privacy');
Route::get('/shipping', [LegalController::class, 'shipping'])->name('legal.shipping');
Route::get('/returns', [LegalController::class, 'returns'])->name('legal.returns');
Route::get('/contact', [LegalController::class, 'contact'])->name('legal.contact');

Route::inertia('/wishlist', 'storefront/wishlist')->name('wishlist.index');

Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

Route::get('/orders/confirmation/{orderNumber}', [OrderConfirmationController::class, 'show'])
    ->name('orders.confirmation');

Route::prefix('api')->group(function () {
    Route::get('/cart', [App\Http\Controllers\Api\CartController::class, 'show']);
    Route::post('/cart/items', [App\Http\Controllers\Api\CartController::class, 'storeItem']);
    Route::patch('/cart/items/{variant}', [App\Http\Controllers\Api\CartController::class, 'updateItem']);
    Route::delete('/cart/items/{variant}', [App\Http\Controllers\Api\CartController::class, 'destroyItem']);
    Route::post('/discount/validate', [DiscountController::class, 'validateCode']);
});

Route::post('/stripe/webhook', StripeWebhookController::class)->name('stripe.webhook');

Route::get('/products/{slug}', [ProductDetailController::class, 'show'])
    ->name('products.show');

Route::get('/{category}', [ProductListingController::class, 'index'])
    ->where('category', 'men|women|kids|jordan')
    ->name('category.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/products/{slug}/reviews', [ProductReviewController::class, 'store'])
        ->name('products.reviews.store');

    Route::get('/orders', [OrderHistoryController::class, 'index'])->name('orders.index');
    Route::get('/orders/{orderNumber}', [OrderHistoryController::class, 'show'])
        ->name('orders.show');

    Route::get('/dashboard', [AccountController::class, 'index'])->name('dashboard');
});

require __DIR__.'/settings.php';
