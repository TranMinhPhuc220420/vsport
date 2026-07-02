<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\DiscountCodeController;
use App\Http\Controllers\Admin\HomepageController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductImageController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VariantController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/export', [OrderController::class, 'export'])->name('orders.export');
        Route::get('orders/{orderNumber}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{orderNumber}/status', [OrderController::class, 'updateStatus'])
            ->name('orders.status.update');

        Route::resource('categories', CategoryController::class)->except(['show']);

        Route::resource('products', ProductController::class)->except(['show']);
        Route::patch('products/{product}/featured', [ProductController::class, 'updateFeatured'])
            ->name('products.featured.update');
        Route::post('products/{product}/colorways', [ProductController::class, 'storeColorway'])
            ->name('products.colorways.store');
        Route::put('colorways/{colorway}', [ProductController::class, 'updateColorway'])
            ->name('colorways.update');
        Route::delete('colorways/{colorway}', [ProductController::class, 'destroyColorway'])
            ->name('colorways.destroy');

        Route::post('colorways/{colorway}/variants', [VariantController::class, 'sync'])
            ->name('colorways.variants.sync');
        Route::patch('colorways/{colorway}/inventory', [VariantController::class, 'updateColorwayInventory'])
            ->name('colorways.inventory.update');
        Route::patch('variants/{variant}/inventory', [VariantController::class, 'updateInventory'])
            ->name('variants.inventory.update');

        Route::post('colorways/{colorway}/images', [ProductImageController::class, 'store'])
            ->name('colorways.images.store');
        Route::post('colorways/{colorway}/images/reorder', [ProductImageController::class, 'reorder'])
            ->name('colorways.images.reorder');
        Route::patch('images/{image}', [ProductImageController::class, 'update'])
            ->name('images.update');
        Route::delete('images/{image}', [ProductImageController::class, 'destroy'])
            ->name('images.destroy');

        Route::get('homepage', [HomepageController::class, 'edit'])->name('homepage.edit');
        Route::put('homepage', [HomepageController::class, 'update'])->name('homepage.update');

        Route::resource('discount-codes', DiscountCodeController::class)->except(['show']);

        Route::get('reviews', [ReviewController::class, 'index'])->name('reviews.index');
        Route::patch('reviews/{review}/approve', [ReviewController::class, 'approve'])->name('reviews.approve');
        Route::delete('reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

        Route::get('analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

        Route::get('activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');

        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::patch('users/{user}/role', [UserController::class, 'updateRole'])
            ->name('users.role.update');

        Route::inertia('preview/design-system', 'admin/preview/design-system')
            ->middleware('local')
            ->name('preview.design-system');
    });
