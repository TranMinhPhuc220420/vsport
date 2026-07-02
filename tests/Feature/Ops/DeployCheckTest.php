<?php

use App\Support\OpsHeartbeat;
use Illuminate\Support\Facades\Cache;

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

test('deploy check passes in local environment', function () {
    $this->artisan('vsport:deploy-check')
        ->assertSuccessful()
        ->expectsOutputToContain('Deploy check passed.');
});

test('deploy check fails when build manifest is missing', function () {
    $manifest = public_path('build/manifest.json');
    $backup = $manifest.'.bak';

    if (! file_exists($manifest)) {
        $this->markTestSkipped('Build manifest not present.');
    }

    rename($manifest, $backup);

    try {
        $this->artisan('vsport:deploy-check')
            ->assertFailed()
            ->expectsOutputToContain('Frontend build missing');
    } finally {
        rename($backup, $manifest);
    }
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
