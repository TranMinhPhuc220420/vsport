<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductSummaryResource;
use App\Models\Product;
use App\Services\Wishlist\WishlistService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class WishlistController extends Controller
{
    public function __construct(
        private readonly WishlistService $wishlist,
    ) {}

    public function index(Request $request): JsonResponse
    {
        return $this->response($this->wishlist->list($request->user()));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'productSlug' => ['required', 'string', 'exists:products,slug'],
        ]);

        $product = Product::query()->where('slug', $validated['productSlug'])->firstOrFail();

        $this->wishlist->add($request->user(), $product);

        return $this->response($this->wishlist->list($request->user()));
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->wishlist->remove($request->user(), $product);

        return $this->response($this->wishlist->list($request->user()));
    }

    public function merge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slugs' => ['nullable', 'array'],
            'slugs.*' => ['string'],
        ]);

        $this->wishlist->mergeSlugs($request->user(), $validated['slugs'] ?? []);

        return $this->response($this->wishlist->list($request->user()));
    }

    /**
     * @param  Collection<int, Product>  $products
     */
    private function response(Collection $products): JsonResponse
    {
        $items = $products->map(function (Product $product) {
            $summary = ProductSummaryResource::make($product)->resolve();

            return [
                'productSlug' => $summary['slug'],
                'productName' => $summary['name'],
                'imageUrl' => $summary['primaryImage']['url'] ?? null,
                'price' => $summary['basePrice'],
                'salePrice' => $summary['salePrice'],
            ];
        })->values()->all();

        return response()->json(['data' => ['items' => $items]]);
    }
}
