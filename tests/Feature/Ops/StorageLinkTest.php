<?php

use Illuminate\Support\Facades\File;

test('storage link endpoint rejects missing token', function () {
    config(['ops.token' => 'secret-ops-token']);

    $this->get('/ops/storage-link')
        ->assertForbidden();
});

test('storage link endpoint rejects invalid token', function () {
    config(['ops.token' => 'secret-ops-token']);

    $this->get('/ops/storage-link?token=wrong')
        ->assertForbidden();
});

test('storage link endpoint is unavailable when ops token is not configured', function () {
    config(['ops.token' => '']);

    $this->get('/ops/storage-link?token=anything')
        ->assertStatus(503);
});

test('storage link endpoint creates public storage symlink', function () {
    config(['ops.token' => 'secret-ops-token']);

    $link = public_path('storage');

    if (File::exists($link)) {
        if (is_link($link)) {
            File::delete($link);
        } else {
            $this->markTestSkipped('public/storage exists and is not a symlink.');
        }
    }

    $this->get('/ops/storage-link?token=secret-ops-token')
        ->assertOk()
        ->assertJson([
            'success' => true,
        ])
        ->assertJsonPath('links.0.status', 'linked');

    expect(is_link($link))->toBeTrue();

    File::delete($link);
});

test('storage link endpoint reports existing symlink', function () {
    config(['ops.token' => 'secret-ops-token']);

    $this->artisan('storage:link')->assertSuccessful();

    $this->get('/ops/storage-link?token=secret-ops-token')
        ->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Storage link already exists.',
        ]);
});
