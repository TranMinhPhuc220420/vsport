<?php

use App\Services\Ops\DeployCheckService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(DeployCheckService::class);
});

test('deploy check passes in testing environment with build manifest', function () {
    $report = $this->service->run();

    expect($report->hasFailures())->toBeFalse()
        ->and(collect($report->items)->pluck('message'))
        ->toContain('APP_KEY is configured.');
});

test('deploy check reports missing build manifest in production', function () {
    $manifest = public_path('build/manifest.json');
    $backup = $manifest.'.bak';

    $this->app->detectEnvironment(fn () => 'production');

    if (file_exists($manifest)) {
        rename($manifest, $backup);
    }

    try {
        $report = $this->service->run();

        expect($report->hasFailures())->toBeTrue()
            ->and(collect($report->items)->pluck('message'))
            ->toContain('Frontend build missing. Run npm run build before deploy.');
    } finally {
        if (file_exists($backup)) {
            rename($backup, $manifest);
        }
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

    $report = $this->service->run(strict: true);

    expect($report->passesStrict())->toBeFalse()
        ->and(collect($report->items)->pluck('message'))
        ->toContain('STRIPE_WEBHOOK_SECRET is missing — card payments may stay pending after checkout.');
});

test('deploy check reports missing app key', function () {
    $originalKey = config('app.key');
    Config::set('app.key', '');

    try {
        $report = $this->service->run();

        expect($report->hasFailures())->toBeTrue()
            ->and(collect($report->items)->pluck('message'))
            ->toContain('APP_KEY is missing. Run php artisan key:generate.');
    } finally {
        Config::set('app.key', $originalKey);
    }
});
