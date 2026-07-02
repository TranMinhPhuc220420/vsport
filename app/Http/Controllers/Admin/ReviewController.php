<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Services\Admin\AdminActivityService;
use App\Services\Review\ReviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function __construct(
        private readonly AdminActivityService $activity,
    ) {}

    public function index(Request $request): Response
    {
        $status = $request->query('status', 'pending');

        $query = ProductReview::query()
            ->with(['user', 'product'])
            ->latest();

        if ($status === 'pending') {
            $query->where('is_approved', false);
        } elseif ($status === 'approved') {
            $query->where('is_approved', true);
        }

        $reviews = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/reviews/index', [
            'reviews' => [
                'data' => collect($reviews->items())->map(fn (ProductReview $review) => [
                    'id' => $review->id,
                    'productName' => $review->product->name,
                    'userName' => $review->user->name,
                    'rating' => $review->rating,
                    'title' => $review->title,
                    'body' => $review->body,
                    'isApproved' => $review->is_approved,
                    'createdAt' => $review->created_at?->toIso8601String(),
                ])->values()->all(),
                'links' => [
                    'first' => $reviews->url(1),
                    'last' => $reviews->url($reviews->lastPage()),
                    'prev' => $reviews->previousPageUrl(),
                    'next' => $reviews->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                    'total' => $reviews->total(),
                ],
            ],
            'filters' => [
                'status' => is_string($status) ? $status : 'pending',
            ],
        ]);
    }

    public function approve(ProductReview $review, ReviewService $reviews): RedirectResponse
    {
        $reviews->approve($review);

        $this->activity->log(
            request()->user(),
            'reviews.approve',
            $review,
            request: request(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.review_approved'),
        ]);

        return back();
    }

    public function destroy(ProductReview $review, ReviewService $reviews): RedirectResponse
    {
        $reviews->delete($review);

        $this->activity->log(
            request()->user(),
            'reviews.destroy',
            $review,
            request: request(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.review_deleted'),
        ]);

        return back();
    }
}
