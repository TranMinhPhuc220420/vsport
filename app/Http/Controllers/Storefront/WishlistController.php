<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('storefront/wishlist', [
            'seo' => PageSeo::forPrivate(
                __('seo.private.wishlist'),
                route('wishlist.index'),
            )->toArray(),
        ]);
    }
}
