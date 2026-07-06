<?php

use App\Models\User;

test('appearance page uses storefront component for customers', function () {
    $user = User::factory()->create();

    $this
        ->actingAs($user)
        ->get(route('appearance.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('storefront/settings/appearance'));
});

test('appearance page uses admin component for admin users', function () {
    $user = User::factory()->admin()->create();

    $this
        ->actingAs($user)
        ->get(route('appearance.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('settings/appearance'));
});
