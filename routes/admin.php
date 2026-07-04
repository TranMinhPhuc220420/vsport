<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CategoryImageController;
use App\Http\Controllers\Admin\CategoryOptionTemplateController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DiscountCodeController;
use App\Http\Controllers\Admin\HomepageController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProductImageController;
use App\Http\Controllers\Admin\ReviewController;
use App\Http\Controllers\Admin\StoreSettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\VariantController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('settings', [StoreSettingController::class, 'edit'])->name('settings.edit');
        Route::put('settings', [StoreSettingController::class, 'update'])->name('settings.update');

        Route::get('orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('orders/export', [OrderController::class, 'export'])->name('orders.export');
        Route::get('orders/{orderNumber}', [OrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{orderNumber}/status', [OrderController::class, 'updateStatus'])
            ->name('orders.status.update');

        Route::resource('categories', CategoryController::class)->except(['show']);
        Route::post('categories/{category}/image', [CategoryImageController::class, 'store'])
            ->name('categories.image.store');
        Route::patch('categories/{category}/image-alt', [CategoryImageController::class, 'updateAlt'])
            ->name('categories.image-alt.update');
        Route::delete('categories/{category}/image', [CategoryImageController::class, 'destroy'])
            ->name('categories.image.destroy');
        Route::put('categories/{category}/option-templates', [CategoryOptionTemplateController::class, 'sync'])
            ->name('categories.option-templates.sync');

        Route::post('products/bulk-delete', [ProductController::class, 'bulkDestroy'])
            ->name('products.bulk-delete');
        Route::patch('products/bulk-featured', [ProductController::class, 'bulkUpdateFeatured'])
            ->name('products.bulk-featured');
        Route::patch('products/bulk-category', [ProductController::class, 'bulkAssignCategory'])
            ->name('products.bulk-category');

        Route::resource('products', ProductController::class)->except(['show']);
        Route::patch('products/{product}/featured', [ProductController::class, 'updateFeatured'])
            ->name('products.featured.update');
        Route::put('products/{product}/options', [ProductController::class, 'syncOptions'])
            ->name('products.options.sync');
        Route::post('products/{product}/variants/generate', [ProductController::class, 'generateVariants'])
            ->name('products.variants.generate');
        Route::put('products/{product}/attributes', [ProductController::class, 'syncAttributes'])
            ->name('products.attributes.sync');
        Route::put('products/{product}/customization', [ProductController::class, 'syncCustomization'])
            ->name('products.customization.sync');

        Route::patch('products/{product}/variants/inventory', [VariantController::class, 'updateProductInventory'])
            ->name('products.variants.inventory.update');
        Route::patch('variants/{variant}/inventory', [VariantController::class, 'updateInventory'])
            ->name('variants.inventory.update');

        Route::post('option-values/{optionValue}/images', [ProductImageController::class, 'store'])
            ->name('option-values.images.store');
        Route::post('option-values/{optionValue}/images/reorder', [ProductImageController::class, 'reorder'])
            ->name('option-values.images.reorder');
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
