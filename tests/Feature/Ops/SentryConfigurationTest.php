<?php

use App\Support\SentryEventScrubber;
use Sentry\Event;

test('sentry is disabled when dsn is empty', function () {
    expect(config('sentry.dsn'))->toBeEmpty()
        ->and(config('sentry.send_default_pii'))->toBeFalse();
});

test('sentry scrubber redacts sensitive checkout fields', function () {
    $event = Event::createEvent();
    $event->setRequest([
        'url' => 'https://example.test/checkout',
        'method' => 'POST',
        'data' => [
            'customerName' => 'Jane Doe',
            'customerEmail' => 'jane@example.com',
            'customerPhone' => '+84901234567',
            'shippingAddress' => '123 Street',
            'payment_method' => 'cod',
        ],
    ]);

    $scrubbed = SentryEventScrubber::scrub($event, null);
    $data = $scrubbed?->getRequest()['data'] ?? [];

    expect($data['customerEmail'])->toBe('[Filtered]')
        ->and($data['customerPhone'])->toBe('[Filtered]')
        ->and($data['customerName'])->toBe('[Filtered]')
        ->and($data['shippingAddress'])->toBe('[Filtered]')
        ->and($data['payment_method'])->toBe('cod');
});
