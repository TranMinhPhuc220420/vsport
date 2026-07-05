<?php

use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

function storeSettingsPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Test Store',
        'shortDescription' => 'A great store',
        'contactEmail' => 'hello@example.com',
        'contactPhone' => '0123456789',
        'address' => '123 Main St',
        'facebookUrl' => null,
        'instagramUrl' => null,
        'tiktokUrl' => null,
        'youtubeUrl' => null,
        'currency' => 'USD',
    ], $overrides);
}

test('admin can update store settings and regenerate favicon from a png logo', function () {
    $admin = User::factory()->admin()->create();

    $originalFavicon = file_get_contents(public_path('favicon.ico'));
    // Seed a known placeholder so the test does not depend on whatever favicon.ico
    // happens to be on disk (a prior run may have left it identical to the fake image output).
    $placeholderFavicon = "\x00\x00\x01\x00".str_repeat("\x00", 100);
    file_put_contents(public_path('favicon.ico'), $placeholderFavicon);

    try {
        $response = $this->actingAs($admin)->put(
            route('admin.settings.update'),
            storeSettingsPayload([
                'logo' => UploadedFile::fake()->image('logo.png', 64, 64),
            ]),
        );

        $response->assertRedirect(route('admin.settings.edit'));

        $profile = SiteSetting::getValue('store_profile');
        expect($profile['name'])->toBe('Test Store')
            ->and($profile['logoUrl'])->not->toBeNull();

        expect(file_get_contents(public_path('favicon.ico')))
            ->not->toBe($placeholderFavicon);

        expect(file_get_contents(public_path('favicon.ico')))
            ->toStartWith("\x00\x00\x01\x00");
    } finally {
        file_put_contents(public_path('favicon.ico'), $originalFavicon);
    }
});

test('admin can upload a wide logo alongside the square logo', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->put(
        route('admin.settings.update'),
        storeSettingsPayload([
            'logo' => UploadedFile::fake()->image('logo.png', 64, 64),
            'logoWide' => UploadedFile::fake()->image('logo-wide.png', 400, 80),
        ]),
    );

    $response->assertRedirect(route('admin.settings.edit'));

    $profile = SiteSetting::getValue('store_profile');
    expect($profile['logoUrl'])->not->toBeNull()
        ->and($profile['logoWideUrl'])->not->toBeNull()
        ->and($profile['logoWideUrl'])->not->toBe($profile['logoUrl']);
});

test('uploading an svg logo skips favicon regeneration without failing the save', function () {
    $admin = User::factory()->admin()->create();

    $originalFavicon = file_get_contents(public_path('favicon.ico'));

    try {
        $svg = UploadedFile::fake()->createWithContent(
            'logo.svg',
            '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
        );

        $response = $this->actingAs($admin)->put(
            route('admin.settings.update'),
            storeSettingsPayload(['logo' => $svg]),
        );

        $response->assertRedirect(route('admin.settings.edit'));

        $profile = SiteSetting::getValue('store_profile');
        expect($profile['name'])->toBe('Test Store');

        expect(file_get_contents(public_path('favicon.ico')))->toBe($originalFavicon);
    } finally {
        file_put_contents(public_path('favicon.ico'), $originalFavicon);
    }
});

test('customer cannot update store settings', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('admin.settings.update'), storeSettingsPayload())
        ->assertForbidden();
});

test('guest cannot update store settings', function () {
    $this->put(route('admin.settings.update'), storeSettingsPayload())
        ->assertRedirect(route('login'));
});
