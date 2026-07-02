<?php

use App\Models\User;
use Illuminate\Support\Facades\App;

test('default locale is vi when no cookie is set', function () {
    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->where('locale', 'vi'));

    expect(App::getLocale())->toBe('vi');
});

test('locale cookie en sets application locale to en', function () {
    $response = $this->withUnencryptedCookie('locale', 'en')
        ->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('locale', 'en')
            ->has('locales', 2)
        );

    expect(App::getLocale())->toBe('en');
});

test('invalid locale cookie falls back to vi', function () {
    $response = $this->withUnencryptedCookie('locale', 'fr')
        ->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page->where('locale', 'vi'));

    expect(App::getLocale())->toBe('vi');
});

test('locale cookie persists on admin pages', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->withUnencryptedCookie('locale', 'en')
        ->get(route('admin.dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('locale', 'en'));
});
