<?php

namespace App\Console\Commands;

use App\Services\Analytics\AnalyticsSyncService;
use App\Support\OpsHeartbeat;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncAnalytics extends Command
{
    protected $signature = 'analytics:sync';

    protected $description = 'Sync completed orders into analytics fact tables';

    public function handle(AnalyticsSyncService $analytics): int
    {
        $count = $analytics->sync();

        OpsHeartbeat::record(OpsHeartbeat::ANALYTICS_SYNC);

        Log::info('scheduler.analytics.sync', ['lines' => $count]);

        $this->info("Synced {$count} order line(s).");

        return self::SUCCESS;
    }
}
