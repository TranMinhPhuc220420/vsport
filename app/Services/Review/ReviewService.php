<?php

namespace App\Services\Review;

use App\Models\Product;
use App\Models\ProductReview;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    /**
     * @param  array{rating: int, title?: string|null, body?: string|null}  $data
     */
    public function create(User $user, Product $product, array $data): ProductReview
    {
        return ProductReview::query()->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => $data['rating'],
            'title' => $data['title'] ?? null,
            'body' => $data['body'] ?? null,
            'is_approved' => false,
        ]);
    }

    public function approve(ProductReview $review): ProductReview
    {
        $review->update(['is_approved' => true]);
        $this->recalculateProductAggregates($review->product_id);

        return $review->fresh();
    }

    public function delete(ProductReview $review): void
    {
        $productId = $review->product_id;
        $wasApproved = $review->is_approved;
        $review->delete();

        if ($wasApproved) {
            $this->recalculateProductAggregates($productId);
        }
    }

    public function recalculateProductAggregates(int $productId): void
    {
        $stats = ProductReview::query()
            ->where('product_id', $productId)
            ->where('is_approved', true)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as review_count')
            ->first();

        Product::query()->whereKey($productId)->update([
            'average_rating' => round((float) ($stats->avg_rating ?? 0), 2),
            'review_count' => (int) ($stats->review_count ?? 0),
        ]);
    }
}
