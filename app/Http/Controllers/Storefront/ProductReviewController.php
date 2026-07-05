<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductReviewRequest;
use App\Services\Catalog\ProductCatalogService;
use App\Services\Review\ReviewService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ProductReviewController extends Controller
{
    public function __construct(
        private readonly ProductCatalogService $catalog,
        private readonly ReviewService $reviews,
    ) {}

    public function store(StoreProductReviewRequest $request, string $slug): RedirectResponse
    {
        $product = $this->catalog->findBySlug($slug);

        $review = $this->reviews->create($request->user(), $product, $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $review->wasRecentlyCreated
                ? __('messages.review_submitted')
                : __('messages.review_updated'),
        ]);

        return back();
    }
}
