<?php

use App\Exceptions\CheckoutStockException;
use App\Models\Inventory;
use App\Models\ProductVariant;
use App\Services\Cart\InventoryReservationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(InventoryReservationService::class);
});

test('reserveDelta increases reserved quantity when stock is available', function () {
    $variant = ProductVariant::factory()->create();
    $inventory = Inventory::factory()->create([
        'variant_id' => $variant->id,
        'quantity' => 10,
        'reserved_quantity' => 2,
    ]);

    $this->service->reserveDelta($variant, 3);

    expect($inventory->fresh()->reserved_quantity)->toBe(5);
});

test('reserveDelta rejects quantity greater than available stock', function () {
    $variant = ProductVariant::factory()->create();
    Inventory::factory()->create([
        'variant_id' => $variant->id,
        'quantity' => 5,
        'reserved_quantity' => 4,
    ]);

    $this->service->reserveDelta($variant, 2);
})->throws(CheckoutStockException::class);

test('reserveDelta no-ops when delta is zero', function () {
    $variant = ProductVariant::factory()->create();
    $inventory = Inventory::factory()->create([
        'variant_id' => $variant->id,
        'quantity' => 5,
        'reserved_quantity' => 1,
    ]);

    $this->service->reserveDelta($variant, 0);

    expect($inventory->fresh()->reserved_quantity)->toBe(1);
});

test('release reduces reserved quantity', function () {
    $variant = ProductVariant::factory()->create();
    $inventory = Inventory::factory()->create([
        'variant_id' => $variant->id,
        'quantity' => 10,
        'reserved_quantity' => 4,
    ]);

    $this->service->release($variant->id, 2);

    expect($inventory->fresh()->reserved_quantity)->toBe(2);
});

test('release clamps reserved quantity to zero', function () {
    $variant = ProductVariant::factory()->create();
    $inventory = Inventory::factory()->create([
        'variant_id' => $variant->id,
        'quantity' => 10,
        'reserved_quantity' => 2,
    ]);

    $this->service->release($variant->id, 5);

    expect($inventory->fresh()->reserved_quantity)->toBe(0);
});
