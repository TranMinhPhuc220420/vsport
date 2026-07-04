<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('storefront/cart', [
            'seo' => PageSeo::forPrivate(__('seo.private.cart'), route('cart.index'))->toArray(),
        ]);
    }
}
