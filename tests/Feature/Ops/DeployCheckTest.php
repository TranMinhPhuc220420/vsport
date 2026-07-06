<?php

use App\Mail\LowStockAlertMail;
use App\Models\Inventory;
use App\Models\ProductVariant;
use App\Support\OpsHeartbeat;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

test('release expired carts records scheduler heartbeat', function () {
    Cache::forget(OpsHeartbeat::CARTS_RELEASE_EXPIRED);

    $this->artisan('carts:release-expired')->assertSuccessful();

    expect(OpsHeartbeat::lastRun(OpsHeartbeat::CARTS_RELEASE_EXPIRED))->not->toBeNull();
});

test('analytics sync records scheduler heartbeat', function () {
    Cache::forget(OpsHeartbeat::ANALYTICS_SYNC);

    $this->artisan('analytics:sync')->assertSuccessful();

    expect(OpsHeartbeat::lastRun(OpsHeartbeat::ANALYTICS_SYNC))->not->toBeNull();
});

test('check low stock records scheduler heartbeat', function () {
    Cache::forget(OpsHeartbeat::INVENTORY_LOW_STOCK_CHECK);

    $this->artisan('inventory:check-low-stock')->assertSuccessful();

    expect(OpsHeartbeat::lastRun(OpsHeartbeat::INVENTORY_LOW_STOCK_CHECK))->not->toBeNull();
});

test('check low stock command sends mail when threshold is breached', function () {
    Mail::fake();

    $variant = ProductVariant::factory()->create();
    Inventory::factory()->for($variant, 'variant')->create([
        'quantity' => 1,
        'reserved_quantity' => 0,
    ]);

    $this->artisan('inventory:check-low-stock')->assertSuccessful();

    Mail::assertQueued(LowStockAlertMail::class);
});

test('deploy check passes in local environment', function () {
    $this->artisan('vsport:deploy-check')
        ->assertSuccessful()
        ->expectsOutputToContain('Deploy check passed.');
});

test('deploy check fails when build manifest is missing in production', function () {
    $manifest = public_path('build/manifest.json');
    $backup = $manifest.'.bak';

    if (! file_exists($manifest)) {
        $this->markTestSkipped('Build manifest not present.');
    }

    app()->instance('env', 'production');

    rename($manifest, $backup);

    try {
        $this->artisan('vsport:deploy-check')
            ->assertFailed()
            ->expectsOutputToContain('Frontend build missing');
    } finally {
        rename($backup, $manifest);
    }
});

test('deploy check warns when queue connection is sync in production', function () {
    app()->instance('env', 'production');

    config([
        'queue.default' => 'sync',
        'app.debug' => false,
        'mail.default' => 'smtp',
        'mail.from.address' => 'orders@zovasport.test',
    ]);

    $this->artisan('vsport:deploy-check --strict')
        ->assertFailed()
        ->expectsOutputToContain('QUEUE_CONNECTION is sync');
});

test('deploy check strict mode fails on stripe webhook warning', function () {
    config([
        'filesystems.disks.supabase.key' => 'test-key',
        'filesystems.disks.supabase.bucket' => 'test-bucket',
        'services.stripe.key' => 'pk_test_x',
        'services.stripe.secret' => 'sk_test_x',
        'services.stripe.webhook_secret' => '',
    ]);

    $this->artisan('vsport:deploy-check --strict')
        ->assertFailed()
        ->expectsOutputToContain('STRIPE_WEBHOOK_SECRET');
});
