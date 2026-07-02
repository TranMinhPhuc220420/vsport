<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $recentOrders = Order::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(3)
            ->get();

        return Inertia::render('storefront/account/index', [
            'recentOrders' => OrderResource::collection($recentOrders)->resolve(),
        ]);
    }
}
