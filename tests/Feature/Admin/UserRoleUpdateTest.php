<?php

use App\Enums\UserRole;
use App\Models\User;

test('admin can change another users role', function () {
    $admin = User::factory()->admin()->create();
    $customer = User::factory()->create();

    $this->actingAs($admin)
        ->patch(route('admin.users.role.update', $customer), [
            'role' => UserRole::Admin->value,
        ])
        ->assertRedirect();

    expect($customer->fresh()->role)->toBe(UserRole::Admin);
});

test('admin cannot demote their own account', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->from(route('admin.users.index'))
        ->patch(route('admin.users.role.update', $admin), [
            'role' => UserRole::Customer->value,
        ])
        ->assertRedirect(route('admin.users.index'))
        ->assertSessionHasErrors('role');

    expect($admin->fresh()->role)->toBe(UserRole::Admin);
});

test('admin cannot demote the last admin', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->from(route('admin.users.index'))
        ->patch(route('admin.users.role.update', $admin), [
            'role' => UserRole::Customer->value,
        ])
        ->assertSessionHasErrors('role');
});
