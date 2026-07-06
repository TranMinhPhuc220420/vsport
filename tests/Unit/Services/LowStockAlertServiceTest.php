<?php

use App\Mail\LowStockAlertMail;
use App\Models\Inventory;
use App\Models\ProductVariant;
use App\Services\Inventory\LowStockAlertService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    config(['inventory.low_stock_threshold' => 5]);
    $this->service = app(LowStockAlertService::class);
});

test('includes variants at or below the threshold', function () {
    $variant = ProductVariant::factory()->create();
    Inventory::factory()->for($variant, 'variant')->create([
        'quantity' => 5,
        'reserved_quantity' => 0,
    ]);

    $lowStock = $this->service->lowStockInventories();

    expect($lowStock->pluck('variant_id'))->toContain($variant->id);
});

test('excludes variants above the threshold', function () {
    $variant = ProductVariant::factory()->create();
    Inventory::factory()->for($variant, 'variant')->create([
        'quantity' => 6,
        'reserved_quantity' => 0,
    ]);

    $lowStock = $this->service->lowStockInventories();

    expect($lowStock->pluck('variant_id'))->not->toContain($variant->id);
});

test('checkAndNotify emails once and dedupes on a second run', function () {
    Mail::fake();

    $variant = ProductVariant::factory()->create();
    Inventory::factory()->for($variant, 'variant')->create([
        'quantity' => 2,
        'reserved_quantity' => 0,
    ]);

    $firstRun = $this->service->checkAndNotify();
    $secondRun = $this->service->checkAndNotify();

    expect($firstRun)->toBe(1)
        ->and($secondRun)->toBe(0);

    Mail::assertQueued(LowStockAlertMail::class, 1);
});
