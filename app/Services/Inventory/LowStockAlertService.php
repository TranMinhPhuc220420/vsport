<?php

namespace App\Services\Inventory;

use App\Mail\LowStockAlertMail;
use App\Models\Inventory;
use App\Services\Admin\StoreSettingsService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class LowStockAlertService
{
    private const DEDUP_CACHE_PREFIX = 'low_stock_alert:';

    private const DEDUP_HOURS = 72;

    public function __construct(
        private readonly StoreSettingsService $storeSettings,
    ) {}

    /**
     * @return Collection<int, Inventory>
     */
    public function lowStockInventories(): Collection
    {
        $threshold = (int) config('inventory.low_stock_threshold');

        return Inventory::query()
            ->whereRaw('quantity - reserved_quantity <= ?', [$threshold])
            ->with('variant.product')
            ->get();
    }

    /**
     * Send a digest email for newly low-stock variants, skipping ones
     * already alerted within the dedup window. Returns how many were alerted.
     */
    public function checkAndNotify(): int
    {
        $lowStock = $this->lowStockInventories()
            ->filter(fn (Inventory $inventory) => $inventory->variant !== null && $inventory->variant->product !== null)
            ->filter(fn (Inventory $inventory) => ! Cache::has($this->cacheKey($inventory->variant_id)));

        if ($lowStock->isEmpty()) {
            return 0;
        }

        $items = $lowStock->map(fn (Inventory $inventory) => [
            'sku' => $inventory->variant->sku,
            'productName' => $inventory->variant->product->name,
            'available' => $inventory->availableQuantity(),
        ])->values()->all();

        $recipient = $this->storeSettings->profile()['contactEmail'] ?? null;

        if (is_string($recipient) && $recipient !== '') {
            Mail::to($recipient)->send(new LowStockAlertMail($items));
        }

        foreach ($lowStock as $inventory) {
            Cache::put($this->cacheKey($inventory->variant_id), true, now()->addHours(self::DEDUP_HOURS));
        }

        return $lowStock->count();
    }

    private function cacheKey(int $variantId): string
    {
        return self::DEDUP_CACHE_PREFIX.$variantId;
    }
}
