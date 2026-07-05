<?php

use App\Models\NewsletterSubscriber;

test('newsletter subscribe stores email', function () {
    $this->post(route('newsletter.subscribe'), [
        'email' => 'runner@example.com',
        'source' => 'homepage',
    ])->assertRedirect();

    expect(NewsletterSubscriber::query()->where('email', 'runner@example.com')->exists())
        ->toBeTrue();
});

test('newsletter subscribe validates email', function () {
    $this->post(route('newsletter.subscribe'), [
        'email' => 'not-an-email',
        'source' => 'blog',
    ])->assertSessionHasErrors('email');
});

test('newsletter subscribe updates duplicate email', function () {
    NewsletterSubscriber::query()->create([
        'email' => 'runner@example.com',
        'source' => 'homepage',
        'subscribed_at' => now()->subDay(),
    ]);

    $this->post(route('newsletter.subscribe'), [
        'email' => 'runner@example.com',
        'source' => 'blog',
    ])->assertRedirect();

    expect(NewsletterSubscriber::query()->count())->toBe(1);

    $subscriber = NewsletterSubscriber::query()->firstOrFail();

    expect($subscriber->source->value)->toBe('blog');
});

test('newsletter subscribe normalizes email to lowercase', function () {
    $this->post(route('newsletter.subscribe'), [
        'email' => 'Runner@Example.com',
        'source' => 'homepage',
    ])->assertRedirect();

    expect(NewsletterSubscriber::query()->where('email', 'runner@example.com')->exists())
        ->toBeTrue();
});

test('newsletter subscribe rejects invalid source', function () {
    $this->post(route('newsletter.subscribe'), [
        'email' => 'runner@example.com',
        'source' => 'invalid-source',
    ])->assertSessionHasErrors('source');
});

test('newsletter subscribe flashes success status', function () {
    $this->post(route('newsletter.subscribe'), [
        'email' => 'runner@example.com',
        'source' => 'homepage',
    ])->assertRedirect()
        ->assertSessionHas('newsletter.status', 'success');
});
