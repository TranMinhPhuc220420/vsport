<?php

use App\Http\Controllers\Api\DiscountController;
use App\Http\Controllers\Ops\ClearCacheController;
use App\Http\Controllers\Ops\StorageLinkController;
use App\Http\Controllers\Storefront\AccountController;
use App\Http\Controllers\Storefront\BlogController;
use App\Http\Controllers\Storefront\BlogRssController;
use App\Http\Controllers\Storefront\CartController;
use App\Http\Controllers\Storefront\CheckoutController;
use App\Http\Controllers\Storefront\HomeController;
use App\Http\Controllers\Storefront\LegalController;
use App\Http\Controllers\Storefront\NewsletterController;
use App\Http\Controllers\Storefront\OrderConfirmationController;
use App\Http\Controllers\Storefront\OrderHistoryController;
use App\Http\Controllers\Storefront\OrderLookupController;
use App\Http\Controllers\Storefront\OrderTrackingController;
use App\Http\Controllers\Storefront\ProductDetailController;
use App\Http\Controllers\Storefront\ProductListingController;
use App\Http\Controllers\Storefront\ProductReviewController;
use App\Http\Controllers\Storefront\ProductSearchController;
use App\Http\Controllers\Storefront\ReturnRequestController;
use App\Http\Controllers\Storefront\RobotsController;
use App\Http\Controllers\Storefront\SitemapController;
use App\Http\Controllers\Storefront\WishlistController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', SitemapController::class)->name('sitemap');
Route::get('/robots.txt', RobotsController::class)->name('robots');

Route::get('/ops/storage-link', StorageLinkController::class)
    ->middleware('ops')
    ->name('ops.storage-link');

Route::get('/ops/clear-cache', ClearCacheController::class)
    ->middleware('ops')
    ->name('ops.clear-cache');

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

Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist.index');

Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');

Route::get('/orders/confirmation/{orderNumber}', [OrderConfirmationController::class, 'show'])
    ->name('orders.confirmation');

Route::get('/orders/lookup', [OrderLookupController::class, 'create'])->name('orders.lookup.create');
Route::post('/orders/lookup', [OrderLookupController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('orders.lookup.store');

Route::get('/orders/track', [OrderTrackingController::class, 'create'])->name('orders.track.create');
Route::post('/orders/track', [OrderTrackingController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('orders.track.store');
Route::get('/orders/{orderNumber}/track', [OrderTrackingController::class, 'show'])
    ->name('orders.track.show');

Route::prefix('api')->group(function () {
    Route::get('/cart', [App\Http\Controllers\Api\CartController::class, 'show']);
    Route::post('/cart/items', [App\Http\Controllers\Api\CartController::class, 'storeItem']);
    Route::patch('/cart/items/{variant}', [App\Http\Controllers\Api\CartController::class, 'updateItem']);
    Route::delete('/cart/items/{variant}', [App\Http\Controllers\Api\CartController::class, 'destroyItem']);
    Route::post('/discount/validate', [DiscountController::class, 'validateCode']);
});

Route::middleware(['auth'])->prefix('api/wishlist')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\WishlistController::class, 'index']);
    Route::post('/items', [App\Http\Controllers\Api\WishlistController::class, 'store']);
    Route::delete('/items/{product}', [App\Http\Controllers\Api\WishlistController::class, 'destroy']);
    Route::post('/merge', [App\Http\Controllers\Api\WishlistController::class, 'merge']);
});

Route::post('/stripe/webhook', StripeWebhookController::class)->name('stripe.webhook');

Route::get('/products/{slug}', [ProductDetailController::class, 'show'])
    ->name('products.show');

Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/feed.xml', BlogRssController::class)->name('blog.feed');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
Route::post('/newsletter/subscribe', [NewsletterController::class, 'store'])
    ->name('newsletter.subscribe');

require __DIR__.'/admin.php';

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/products/{slug}/reviews', [ProductReviewController::class, 'store'])
        ->name('products.reviews.store');

    Route::get('/orders', [OrderHistoryController::class, 'index'])->name('orders.index');
    Route::get('/orders/{orderNumber}', [OrderHistoryController::class, 'show'])
        ->name('orders.show');
    Route::get('/orders/{orderNumber}/returns', [ReturnRequestController::class, 'create'])
        ->name('orders.returns.create');
    Route::post('/orders/{orderNumber}/returns', [ReturnRequestController::class, 'store'])
        ->name('orders.returns.store');

    Route::get('/dashboard', [AccountController::class, 'index'])->name('dashboard');
});

Route::get('/{category}', [ProductListingController::class, 'index'])
    ->where('category', '[a-z0-9-]+')
    ->name('category.show');

require __DIR__.'/settings.php';
