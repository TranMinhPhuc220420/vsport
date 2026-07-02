<?php

use App\Models\User;

test('customers cannot access admin product pages', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('admin.products.index'))->assertForbidden();
    $this->get(route('admin.categories.index'))->assertForbidden();
    $this->get(route('admin.orders.index'))->assertForbidden();
    $this->get(route('admin.users.index'))->assertForbidden();
});

test('admins can access admin catalog pages', function () {
    $admin = User::factory()->admin()->create();
    $this->actingAs($admin);

    $this->get(route('admin.products.index'))->assertOk();
    $this->get(route('admin.categories.index'))->assertOk();
});
