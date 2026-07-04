<?php

namespace App\Services\Admin;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Support\Carbon;

class DashboardMetricsService
{
    /**
     * Trailing-N-days vs. prior-N-days comparison for revenue, orders
     * placed, and average order value.
     *
     * @return array{
     *     periodRevenueTotal: float,
     *     periodRevenueTrend: array{direction: string, percent: float|null},
     *     periodOrdersCount: int,
     *     periodOrdersTrend: array{direction: string, percent: float|null},
     *     averageOrderValue: float,
     *     averageOrderValueTrend: array{direction: string, percent: float|null},
     * }
     */
    public function periodStats(int $days = 30): array
    {
        $now = Carbon::now();
        $currentStart = $now->copy()->subDays($days);
        $previousStart = $now->copy()->subDays($days * 2);

        $currentRevenue = $this->revenueBetween($currentStart, $now);
        $previousRevenue = $this->revenueBetween($previousStart, $currentStart);

        $currentOrdersCount = $this->ordersCountBetween($currentStart, $now);
        $previousOrdersCount = $this->ordersCountBetween($previousStart, $currentStart);

        $currentAverageOrderValue = $currentOrdersCount > 0
            ? $currentRevenue / $currentOrdersCount
            : 0.0;
        $previousAverageOrderValue = $previousOrdersCount > 0
            ? $previousRevenue / $previousOrdersCount
            : 0.0;

        return [
            'periodRevenueTotal' => $currentRevenue,
            'periodRevenueTrend' => $this->calculateTrend($currentRevenue, $previousRevenue),
            'periodOrdersCount' => $currentOrdersCount,
            'periodOrdersTrend' => $this->calculateTrend((float) $currentOrdersCount, (float) $previousOrdersCount),
            'averageOrderValue' => $currentAverageOrderValue,
            'averageOrderValueTrend' => $this->calculateTrend($currentAverageOrderValue, $previousAverageOrderValue),
        ];
    }

    private function revenueBetween(Carbon $start, Carbon $end): float
    {
        return (float) Order::query()
            ->where('status', OrderStatus::Completed)
            ->whereBetween('created_at', [$start, $end])
            ->sum('total_amount');
    }

    private function ordersCountBetween(Carbon $start, Carbon $end): int
    {
        return Order::query()
            ->whereBetween('created_at', [$start, $end])
            ->count();
    }

    /**
     * @return array{direction: string, percent: float|null}
     */
    private function calculateTrend(float $current, float $previous): array
    {
        if ($previous === 0.0) {
            return $current === 0.0
                ? ['direction' => 'flat', 'percent' => 0.0]
                : ['direction' => 'up', 'percent' => null];
        }

        $percent = (($current - $previous) / $previous) * 100;

        $direction = match (true) {
            $percent > 0.5 => 'up',
            $percent < -0.5 => 'down',
            default => 'flat',
        };

        return ['direction' => $direction, 'percent' => round($percent, 1)];
    }
}
