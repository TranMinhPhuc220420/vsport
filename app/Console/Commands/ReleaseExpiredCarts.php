<?php

namespace App\Console\Commands;

use App\Services\Cart\CartService;
use App\Support\OpsHeartbeat;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ReleaseExpiredCarts extends Command
{
    protected $signature = 'carts:release-expired';

    protected $description = 'Release inventory reservations for expired carts';

    public function handle(CartService $cartService): int
    {
        $count = $cartService->releaseExpiredCarts();

        OpsHeartbeat::record(OpsHeartbeat::CARTS_RELEASE_EXPIRED);

        Log::info('scheduler.carts.release-expired', ['released' => $count]);

        $this->info("Released {$count} expired cart(s).");

        return self::SUCCESS;
    }
}
