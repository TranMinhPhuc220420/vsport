<?php

use Database\Seeders\AdminUserSeeder;

test('admin seeder creates default admin user', function () {
    $this->seed(AdminUserSeeder::class);

    $this->assertDatabaseHas('users', [
        'email' => env('ADMIN_EMAIL', 'admin@vsport.local'),
        'role' => 'admin',
    ]);
});
