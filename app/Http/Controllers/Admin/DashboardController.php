<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductReview;
use App\Services\Admin\DashboardMetricsService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardMetricsService $metrics,
    ) {}

    public function index(): Response
    {
        $pendingOrdersCount = Order::query()
            ->where('status', OrderStatus::Pending)
            ->count();

        $revenueTotal = (float) Order::query()
            ->where('status', OrderStatus::Completed)
            ->sum('total_amount');

        $productCount = Product::query()->count();

        $ordersByStatus = collect(OrderStatus::cases())
            ->mapWithKeys(fn (OrderStatus $status) => [
                $status->value => Order::query()
                    ->where('status', $status)
                    ->count(),
            ])
            ->all();

        $pendingReviewsCount = ProductReview::query()
            ->where('is_approved', false)
            ->count();

        $lowStockProducts = Product::query()
            ->with(['variants.inventory'])
            ->get()
            ->map(function (Product $product): ?array {
                $totalStock = (int) $product->variants->sum(
                    fn ($variant) => $variant->inventory?->availableQuantity() ?? 0,
                );

                if ($totalStock <= 0 || $totalStock >= 5) {
                    return null;
                }

                return [
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'totalStock' => $totalStock,
                ];
            })
            ->filter()
            ->sortBy('totalStock')
            ->take(5)
            ->values()
            ->all();

        $recentOrders = Order::query()
            ->with(['items', 'user'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'pendingOrdersCount' => $pendingOrdersCount,
                'revenueTotal' => $revenueTotal,
                'productCount' => $productCount,
                'pendingReviewsCount' => $pendingReviewsCount,
                ...$this->metrics->periodStats(),
            ],
            'ordersByStatus' => $ordersByStatus,
            'lowStockProducts' => $lowStockProducts,
            'recentOrders' => [
                'data' => array_values(
                    OrderResource::collection($recentOrders)->resolve(),
                ),
            ],
        ]);
    }
}
