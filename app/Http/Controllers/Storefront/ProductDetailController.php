<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Data\ProductStructuredData;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductSummaryResource;
use App\Models\Product;
use App\Models\ProductImage;
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

        $primaryImage = $this->primaryImageUrl($product);

        return Inertia::render('storefront/products/show', [
            'product' => ProductDetailResource::make($product)->resolve(),
            'relatedProducts' => [
                'data' => array_values($related->resolve()),
            ],
            'seo' => PageSeo::forProduct($product, $primaryImage)->toArray(),
            'structuredData' => ProductStructuredData::forProductPage($product, $primaryImage),
            'initialVariantId' => request()->integer('variant') ?: null,
        ]);
    }

    private function primaryImageUrl(Product $product): ?string
    {
        $galleryOption = $product->options->firstWhere('drives_gallery', true)
            ?? $product->options->first(fn ($o) => $o->display_type->value === 'swatch');

        if ($galleryOption === null) {
            return null;
        }

        $value = $galleryOption->values->first();

        if ($value === null) {
            return null;
        }

        $image = $value->images->firstWhere('is_primary', true)
            ?? $value->images->first();

        return $image instanceof ProductImage ? $image->image_url : null;
    }
}
