<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AppearanceController extends Controller
{
    /**
     * Show the user's appearance settings page.
     */
    public function edit(Request $request): Response
    {
        $view = $request->user()->isCustomer()
            ? 'storefront/settings/appearance'
            : 'settings/appearance';

        return Inertia::render($view);
    }
}
