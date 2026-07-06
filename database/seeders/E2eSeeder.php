<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class E2eSeeder extends Seeder
{
    /**
     * Deterministic users for Playwright smoke tests.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            BrandSeeder::class,
            CatalogSeeder::class,
            SizeGuideSeeder::class,
        ]);

        User::updateOrCreate(
            ['email' => 'customer@e2e.test'],
            [
                'name' => 'E2E Customer',
                'password' => 'password',
                'role' => UserRole::Customer,
                'email_verified_at' => now(),
            ],
        );
    }
}
