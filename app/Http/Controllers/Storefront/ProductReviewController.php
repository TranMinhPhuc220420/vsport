<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductReviewRequest;
use App\Models\Product;
use App\Services\Catalog\ProductCatalogService;
use App\Services\Review\ReviewService;
use Illuminate\Http\RedirectResponse;

class ProductReviewController extends Controller
{
    public function __construct(
        private readonly ProductCatalogService $catalog,
        private readonly ReviewService $reviews,
    ) {}

    public function store(StoreProductReviewRequest $request, string $slug): RedirectResponse
    {
        $product = $this->catalog->findBySlug($slug);

        $this->reviews->create($request->user(), $product, $request->validated());

        return back()->with('success', 'Review submitted for moderation.');
    }
}
