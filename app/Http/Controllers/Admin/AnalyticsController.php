<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Analytics\AnalyticsSyncService;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(AnalyticsSyncService $analytics): Response
    {
        $metrics = $analytics->dashboardMetrics();

        return Inertia::render('admin/analytics/index', $metrics);
    }
}
