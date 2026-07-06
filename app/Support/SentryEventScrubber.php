<?php

namespace App\Support;

use Sentry\Event;
use Sentry\EventHint;

class SentryEventScrubber
{
    /** @var list<string> */
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'current_password',
        'customeremail',
        'customername',
        'customerphone',
        'customer_email',
        'customer_name',
        'customer_phone',
        'shipping_address',
        'shippingaddress',
        'email',
        'phone',
        'token',
    ];

    public static function scrub(Event $event, ?EventHint $hint): ?Event
    {
        $request = $event->getRequest();

        if ($request !== null) {
            $request['data'] = self::scrubArray($request['data'] ?? []);
            $request['cookies'] = self::scrubArray($request['cookies'] ?? []);
            $event->setRequest($request);
        }

        return $event;
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private static function scrubArray(array $values): array
    {
        $scrubbed = [];

        foreach ($values as $key => $value) {
            if (self::isSensitiveKey((string) $key)) {
                $scrubbed[$key] = '[Filtered]';

                continue;
            }

            if (is_array($value)) {
                $scrubbed[$key] = self::scrubArray($value);

                continue;
            }

            $scrubbed[$key] = $value;
        }

        return $scrubbed;
    }

    private static function isSensitiveKey(string $key): bool
    {
        $normalized = strtolower(preg_replace('/[^a-zA-Z]/', '', $key) ?? $key);

        foreach (self::SENSITIVE_KEYS as $sensitive) {
            $needle = strtolower(preg_replace('/[^a-zA-Z]/', '', $sensitive) ?? $sensitive);

            if ($normalized === $needle || str_contains($normalized, $needle)) {
                return true;
            }
        }

        return str_contains($normalized, 'password')
            || str_contains($normalized, 'secret')
            || str_contains($normalized, 'token');
    }
}
