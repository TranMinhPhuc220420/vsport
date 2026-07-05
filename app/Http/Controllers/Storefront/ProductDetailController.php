<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Data\ProductStructuredData;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductSummaryResource;
use App\Http\Resources\SizeGuideResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\SizeGuide;
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
            'product' => [
                ...ProductDetailResource::make($product)->resolve(),
                'sizeGuide' => $this->resolveSizeGuide($product),
            ],
            'relatedProducts' => [
                'data' => array_values($related->resolve()),
            ],
            'seo' => PageSeo::forProduct($product, $primaryImage)->toArray(),
            'structuredData' => ProductStructuredData::forProductPage($product, $primaryImage),
            'initialVariantId' => request()->integer('variant') ?: null,
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function resolveSizeGuide(Product $product): ?array
    {
        $hasSizeOption = $product->options->contains(fn ($option) => $option->name === 'Size');

        if (! $hasSizeOption) {
            return null;
        }

        $query = fn () => SizeGuide::query()->with('rows');

        $sizeGuide = null;

        if ($product->brand_id !== null) {
            $sizeGuide = $query()
                ->where('brand_id', $product->brand_id)
                ->where('category_id', $product->category_id)
                ->first()
                ?? $query()
                    ->where('brand_id', $product->brand_id)
                    ->whereNull('category_id')
                    ->first();
        }

        $sizeGuide ??= $query()
            ->whereNull('brand_id')
            ->where('category_id', $product->category_id)
            ->first();

        $sizeGuide ??= $query()->where('is_default', true)->first();

        return $sizeGuide !== null ? SizeGuideResource::make($sizeGuide)->resolve() : null;
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
