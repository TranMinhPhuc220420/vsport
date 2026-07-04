<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkAssignProductCategoryRequest;
use App\Http\Requests\Admin\BulkDestroyProductsRequest;
use App\Http\Requests\Admin\BulkUpdateFeaturedProductsRequest;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\SyncCustomizationOptionsRequest;
use App\Http\Requests\Admin\SyncProductAttributesRequest;
use App\Http\Requests\Admin\SyncProductOptionsRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\AdminProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\Admin\AdminActivityService;
use App\Services\Catalog\ProductAdminService;
use App\Services\Catalog\ProductOptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductAdminService $products,
        private readonly ProductOptionService $options,
        private readonly AdminActivityService $activity,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $categoryId = $request->integer('category') ?: null;

        $products = Product::query()
            ->with([
                'category',
                'options.values.images',
                'variants.inventory',
            ])
            ->withCount('variants')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('style_code', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->when($categoryId !== null, fn ($query) => $query->where('category_id', $categoryId))
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/products/index', [
            'products' => [
                'data' => collect($products->items())->map(fn (Product $product) => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'styleCode' => $product->style_code,
                    'category' => $product->category?->name,
                    'categoryId' => $product->category_id,
                    'variantsCount' => $product->variants_count,
                    'thumbnailUrl' => $this->productThumbnailUrl($product),
                    'totalStock' => $this->productTotalStock($product),
                    'lowStock' => $this->productHasLowStock($product),
                    'isActive' => $product->variants->isNotEmpty(),
                    'isFeatured' => $product->is_featured,
                ])->values()->all(),
                'links' => [
                    'first' => $products->url(1),
                    'last' => $products->url($products->lastPage()),
                    'prev' => $products->previousPageUrl(),
                    'next' => $products->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'total' => $products->total(),
                ],
            ],
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'category' => $categoryId,
            ],
            'categories' => $this->categoryOptions(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/products/create', [
            'categories' => $this->categoryOptions(),
            'genders' => ['Men', 'Women', 'Kids', 'Unisex'],
        ]);
    }

    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $product = $this->products->createProduct(
            collect($validated)->only([
                'style_code',
                'name',
                'slug',
                'description',
                'category_id',
                'sub_title',
                'base_price',
                'gender',
                'is_customizable',
            ])->all(),
            $validated['options'] ?? null,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.product_created_upload_hint'),
        ]);

        return redirect()->route('admin.products.edit', [
            'product' => $product,
            'tab' => 'options',
        ]);
    }

    public function edit(Request $request, Product $product): Response
    {
        return Inertia::render('admin/products/edit', [
            'product' => AdminProductResource::make(
                $this->products->loadAdminProduct($product),
            )->resolve(),
            'categories' => $this->categoryOptions(),
            'genders' => ['Men', 'Women', 'Kids', 'Unisex'],
            'activeTab' => $request->string('tab')->toString() ?: 'details',
        ]);
    }

    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $this->products->updateProduct($product, $request->validated());

        return redirect()->route('admin.products.edit', $product);
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        return redirect()->route('admin.products.index');
    }

    public function bulkDestroy(BulkDestroyProductsRequest $request): RedirectResponse
    {
        $ids = $request->validated('ids');

        Product::query()->whereIn('id', $ids)->delete();

        $this->activity->log(
            $request->user(),
            'products.bulk_delete',
            null,
            ['ids' => $ids, 'count' => count($ids)],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.products_bulk_deleted'),
        ]);

        return back();
    }

    public function bulkUpdateFeatured(BulkUpdateFeaturedProductsRequest $request): RedirectResponse
    {
        $ids = $request->validated('ids');
        $isFeatured = $request->boolean('is_featured');

        Product::query()->whereIn('id', $ids)->update(['is_featured' => $isFeatured]);

        $this->activity->log(
            $request->user(),
            'products.bulk_featured_update',
            null,
            ['ids' => $ids, 'count' => count($ids), 'is_featured' => $isFeatured],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.products_bulk_featured_updated'),
        ]);

        return back();
    }

    public function bulkAssignCategory(BulkAssignProductCategoryRequest $request): RedirectResponse
    {
        $ids = $request->validated('ids');
        $categoryId = $request->integer('category_id');

        Product::query()->whereIn('id', $ids)->update(['category_id' => $categoryId]);

        $this->activity->log(
            $request->user(),
            'products.bulk_category_update',
            null,
            ['ids' => $ids, 'count' => count($ids), 'category_id' => $categoryId],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.products_bulk_category_updated'),
        ]);

        return back();
    }

    public function syncOptions(SyncProductOptionsRequest $request, Product $product): RedirectResponse
    {
        $this->options->syncOptions($product, $request->validated('options'));

        return redirect()->route('admin.products.edit', ['product' => $product, 'tab' => 'options']);
    }

    public function generateVariants(Product $product): RedirectResponse
    {
        $this->options->generateVariants($product);

        return redirect()->route('admin.products.edit', ['product' => $product, 'tab' => 'inventory']);
    }

    public function syncAttributes(SyncProductAttributesRequest $request, Product $product): RedirectResponse
    {
        $this->products->syncAttributes($product, $request->validated('attributes'));

        return redirect()->route('admin.products.edit', ['product' => $product, 'tab' => 'attributes']);
    }

    public function syncCustomization(SyncCustomizationOptionsRequest $request, Product $product): RedirectResponse
    {
        $this->products->syncCustomizationOptions($product, $request->validated('options'));

        return redirect()->route('admin.products.edit', ['product' => $product, 'tab' => 'options']);
    }

    public function updateFeatured(Request $request, Product $product): RedirectResponse
    {
        $product->update([
            'is_featured' => $request->boolean('is_featured'),
        ]);

        $this->activity->log(
            $request->user(),
            'products.featured.update',
            $product,
            ['is_featured' => $product->is_featured],
            $request,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.product_featured_updated'),
        ]);

        return back();
    }

    private function productThumbnailUrl(Product $product): ?string
    {
        foreach ($product->options as $option) {
            if (! $option->drives_gallery) {
                continue;
            }

            foreach ($option->values as $value) {
                $primary = $value->images->firstWhere('is_primary', true)
                    ?? $value->images->first();

                if ($primary instanceof ProductImage) {
                    return $primary->image_url;
                }
            }
        }

        return null;
    }

    private function productTotalStock(Product $product): int
    {
        return (int) $product->variants->sum(
            fn ($variant) => $variant->inventory?->availableQuantity() ?? 0,
        );
    }

    private function productHasLowStock(Product $product, int $threshold = 5): bool
    {
        $total = $this->productTotalStock($product);

        return $total > 0 && $total < $threshold;
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function categoryOptions(): array
    {
        return Category::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
            ])
            ->all();
    }
}
