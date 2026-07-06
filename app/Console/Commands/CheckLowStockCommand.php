<?php

namespace App\Console\Commands;

use App\Services\Inventory\LowStockAlertService;
use App\Support\OpsHeartbeat;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckLowStockCommand extends Command
{
    protected $signature = 'inventory:check-low-stock';

    protected $description = 'Email the store contact when variants fall at or below the low-stock threshold';

    public function handle(LowStockAlertService $service): int
    {
        $count = $service->checkAndNotify();

        OpsHeartbeat::record(OpsHeartbeat::INVENTORY_LOW_STOCK_CHECK);

        Log::info('scheduler.inventory.check-low-stock', ['alerted' => $count]);

        $this->info("Alerted for {$count} low-stock variant(s).");

        return self::SUCCESS;
    }
}
