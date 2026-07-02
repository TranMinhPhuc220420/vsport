<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductSummaryResource;
use App\Models\Product;
use App\Services\Catalog\ProductCatalogService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Inertia\Inertia;
use Inertia\Response;

class ProductDetailController extends Controller
{
    public function __construct(
        private readonly ProductCatalogService $catalog,
    ) {}

    public function show(string $slug): Response
    {
        try {
            $product = $this->catalog->findBySlug($slug);
        } catch (ModelNotFoundException) {
            abort(404);
        }

        $related = ProductSummaryResource::collection(
            $this->catalog->relatedProducts($product, 8),
        );

        return Inertia::render('storefront/products/show', [
            'product' => ProductDetailResource::make($product)->resolve(),
            'relatedProducts' => [
                'data' => array_values($related->resolve()),
            ],
            'seo' => PageSeo::forProduct(
                $product,
                $this->primaryImageUrl($product),
            )->toArray(),
        ]);
    }

    private function primaryImageUrl(Product $product): ?string
    {
        $colorway = $product->activeColorways->first();

        if ($colorway === null) {
            return null;
        }

        $image = $colorway->images->firstWhere('is_primary', true)
            ?? $colorway->images->first();

        return $image?->image_url;
    }
}
