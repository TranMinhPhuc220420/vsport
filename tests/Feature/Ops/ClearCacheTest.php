<?php

test('clear cache endpoint rejects missing token', function () {
    config(['ops.token' => 'secret-ops-token']);

    $this->get('/ops/clear-cache')
        ->assertForbidden();
});

test('clear cache endpoint rejects invalid token', function () {
    config(['ops.token' => 'secret-ops-token']);

    $this->get('/ops/clear-cache?token=wrong')
        ->assertForbidden();
});

test('clear cache endpoint is unavailable when ops token is not configured', function () {
    config(['ops.token' => '']);

    $this->get('/ops/clear-cache?token=anything')
        ->assertStatus(503);
});

test('clear cache endpoint clears application caches', function () {
    config(['ops.token' => 'secret-ops-token']);

    $this->get('/ops/clear-cache?token=secret-ops-token')
        ->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Cache cleared successfully.',
        ])
        ->assertJsonStructure([
            'commands' => [
                ['command', 'success', 'output'],
            ],
        ])
        ->assertJsonPath('commands.0.command', 'optimize:clear')
        ->assertJsonPath('commands.1.command', 'cache:clear');
});

test('clear cache endpoint can warm caches for production', function () {
    config(['ops.token' => 'secret-ops-token']);

    $this->get('/ops/clear-cache?token=secret-ops-token&warm=1')
        ->assertOk()
        ->assertJson([
            'success' => true,
            'message' => 'Cache cleared and rebuilt successfully.',
        ])
        ->assertJsonPath('commands.2.command', 'config:cache')
        ->assertJsonPath('commands.3.command', 'route:cache')
        ->assertJsonPath('commands.4.command', 'view:cache');
});
