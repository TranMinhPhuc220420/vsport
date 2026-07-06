<?php

use App\Models\NewsletterSubscriber;
use App\Models\User;

test('admin can list newsletter subscribers', function () {
    $admin = User::factory()->admin()->create();

    NewsletterSubscriber::query()->create([
        'email' => 'fan@example.com',
        'source' => 'blog',
        'subscribed_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.newsletter-subscribers.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/newsletter-subscribers/index')
            ->has('subscribers.data', 1));
});

test('admin can filter newsletter subscribers by source', function () {
    $admin = User::factory()->admin()->create();

    NewsletterSubscriber::query()->create([
        'email' => 'blog-fan@example.com',
        'source' => 'blog',
        'subscribed_at' => now(),
    ]);

    NewsletterSubscriber::query()->create([
        'email' => 'home-fan@example.com',
        'source' => 'homepage',
        'subscribed_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('admin.newsletter-subscribers.index', ['source' => 'blog']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('subscribers.data', 1)
            ->where('subscribers.data.0.email', 'blog-fan@example.com'));
});

test('customer cannot access newsletter subscribers admin routes', function () {
    $customer = User::factory()->create();

    $this->actingAs($customer)
        ->get(route('admin.newsletter-subscribers.index'))
        ->assertForbidden();

    $this->actingAs($customer)
        ->get(route('admin.newsletter-subscribers.export'))
        ->assertForbidden();
});

test('admin can export newsletter subscribers as csv', function () {
    $admin = User::factory()->admin()->create();

    NewsletterSubscriber::query()->create([
        'email' => 'fan@example.com',
        'source' => 'blog',
        'subscribed_at' => now(),
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.newsletter-subscribers.export'))
        ->assertOk();

    $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

    $content = $response->streamedContent();

    expect($content)->toContain('fan@example.com')
        ->and($content)->toContain('email,source,subscribed_at');
});
