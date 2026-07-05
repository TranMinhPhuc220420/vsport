<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('admin can upload a richtext inline image', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->postJson(
        route('admin.uploads.richtext-image.store'),
        ['image' => UploadedFile::fake()->image('inline.jpg')],
    );

    $response->assertOk()
        ->assertJsonStructure(['url']);

    $url = (string) $response->json('url');
    expect($url)->not->toBe('');

    Storage::disk('public')->assertExists(
        (string) preg_replace('#^.*/storage/#', '', parse_url($url, PHP_URL_PATH) ?? ''),
    );
});

test('customer cannot upload richtext images', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson(
        route('admin.uploads.richtext-image.store'),
        ['image' => UploadedFile::fake()->image('inline.jpg')],
    )->assertForbidden();
});

test('guest cannot upload richtext images', function () {
    $this->postJson(
        route('admin.uploads.richtext-image.store'),
        ['image' => UploadedFile::fake()->image('inline.jpg')],
    )->assertRedirect(route('login'));
});

test('richtext image upload rejects invalid file type', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->postJson(
        route('admin.uploads.richtext-image.store'),
        ['image' => UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf')],
    );

    $response->assertInvalid(['image']);
});
