<?php

use App\Enums\DiscountType;
use App\Models\DiscountCode;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(CatalogSeeder::class);
});

test('admin can manage discount codes', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.discount-codes.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/discount-codes/index'));

    $this->actingAs($admin)
        ->post(route('admin.discount-codes.store'), [
            'code' => 'WELCOME20',
            'type' => DiscountType::Fixed->value,
            'value' => 20,
            'minOrderAmount' => 50,
            'maxUses' => 100,
            'isActive' => true,
        ])
        ->assertRedirect(route('admin.discount-codes.index'));

    $code = DiscountCode::query()->where('code', 'WELCOME20')->first();

    expect($code)->not->toBeNull()
        ->and($code->type)->toBe(DiscountType::Fixed)
        ->and((float) $code->value)->toBe(20.0);
});
