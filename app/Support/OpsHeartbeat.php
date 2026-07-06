<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;

class OpsHeartbeat
{
    public const CARTS_RELEASE_EXPIRED = 'ops.scheduler.carts-release-expired';

    public const ANALYTICS_SYNC = 'ops.scheduler.analytics-sync';

    public const INVENTORY_LOW_STOCK_CHECK = 'ops.scheduler.inventory-low-stock-check';

    public static function record(string $key): void
    {
        Cache::put($key, now()->toIso8601String(), now()->addDays(14));
    }

    public static function lastRun(string $key): ?Carbon
    {
        $value = Cache::get($key);

        if (! is_string($value) || $value === '') {
            return null;
        }

        return Carbon::parse($value);
    }
}
