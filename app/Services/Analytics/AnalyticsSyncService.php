<?php

namespace App\Services\Analytics;

use App\Enums\OrderStatus;
use App\Models\Analytics\DimCustomer;
use App\Models\Analytics\DimDate;
use App\Models\Analytics\DimProduct;
use App\Models\Analytics\FactSale;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class AnalyticsSyncService
{
    public function sync(): int
    {
        $count = 0;

        Order::query()
            ->where('status', OrderStatus::Completed)
            ->with(['items.variant.colorway.product', 'user'])
            ->orderBy('id')
            ->chunkById(100, function ($orders) use (&$count): void {
                foreach ($orders as $order) {
                    foreach ($order->items as $item) {
                        $this->upsertFactLine($order, $item);
                        $count++;
                    }
                }
            });

        return $count;
    }

    private function upsertFactLine(Order $order, OrderItem $item): void
    {
        $dateKey = $order->updated_at?->toDateString() ?? now()->toDateString();
        $this->ensureDimDate($dateKey);

        $customer = DimCustomer::query()->updateOrCreate(
            ['user_id' => $order->user_id],
            ['email' => $order->user?->email ?? 'guest'],
        );

        $product = $item->variant?->colorway?->product;
        $productDim = DimProduct::query()->updateOrCreate(
            ['product_id' => $product?->id ?? 0],
            [
                'name' => $product?->name ?? $item->product_name,
                'slug' => $product?->slug ?? 'unknown',
            ],
        );

        FactSale::query()->updateOrCreate(
            ['order_item_id' => $item->id],
            [
                'order_id' => $order->id,
                'date_key' => $dateKey,
                'customer_dim_id' => $customer->id,
                'product_dim_id' => $productDim->id,
                'quantity' => $item->quantity,
                'line_revenue' => (float) $item->unit_price * $item->quantity,
            ],
        );
    }

    private function ensureDimDate(string $dateKey): void
    {
        if (DimDate::query()->where('date_key', $dateKey)->exists()) {
            return;
        }

        $date = \Illuminate\Support\Carbon::parse($dateKey);

        DimDate::query()->create([
            'date_key' => $dateKey,
            'year' => $date->year,
            'month' => $date->month,
            'day' => $date->day,
            'quarter' => (int) ceil($date->month / 3),
        ]);
    }

    /**
     * @return array{
     *     revenueByDay: list<array{date: string, revenue: float}>,
     *     topProducts: list<array{name: string, revenue: float, quantity: int}>,
     *     averageOrderValue: float,
     * }
     */
    public function dashboardMetrics(): array
    {
        $revenueByDay = FactSale::query()
            ->select('date_key', DB::raw('SUM(line_revenue) as revenue'))
            ->groupBy('date_key')
            ->orderByDesc('date_key')
            ->limit(30)
            ->get()
            ->map(fn ($row) => [
                'date' => (string) $row->date_key,
                'revenue' => round((float) $row->revenue, 2),
            ])
            ->values()
            ->all();

        $topProducts = FactSale::query()
            ->join('dim_products', 'dim_products.id', '=', 'fact_sales.product_dim_id')
            ->select(
                'dim_products.name',
                DB::raw('SUM(fact_sales.line_revenue) as revenue'),
                DB::raw('SUM(fact_sales.quantity) as quantity'),
            )
            ->groupBy('dim_products.id', 'dim_products.name')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->name,
                'revenue' => round((float) $row->revenue, 2),
                'quantity' => (int) $row->quantity,
            ])
            ->values()
            ->all();

        $orderCount = FactSale::query()->distinct('order_id')->count('order_id');
        $totalRevenue = (float) FactSale::query()->sum('line_revenue');

        return [
            'revenueByDay' => $revenueByDay,
            'topProducts' => $topProducts,
            'averageOrderValue' => $orderCount > 0 ? round($totalRevenue / $orderCount, 2) : 0.0,
        ];
    }
}
