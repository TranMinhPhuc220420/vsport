<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreColorwayRequest;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateColorwayRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\AdminProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductColorway;
use App\Models\ProductImage;
use App\Services\Admin\AdminActivityService;
use App\Services\Catalog\ProductAdminService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductAdminService $products,
        private readonly AdminActivityService $activity,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $categoryId = $request->integer('category') ?: null;

        $products = Product::query()
            ->with([
                'category',
                'colorways.images',
                'colorways.variants.inventory',
            ])
            ->withCount('colorways')
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
                    'colorwaysCount' => $product->colorways_count,
                    'thumbnailUrl' => $this->productThumbnailUrl($product),
                    'totalStock' => $this->productTotalStock($product),
                    'lowStock' => $this->productHasLowStock($product),
                    'isActive' => $product->colorways->contains(fn (ProductColorway $colorway) => $colorway->is_active),
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
            ])->all(),
            [
                'colorway_code' => $validated['colorway_code'],
                'color_name' => $validated['color_name'],
                'discount_price' => $validated['discount_price'] ?? null,
                'sizes' => $validated['sizes'],
            ],
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.product_created_upload_hint'),
        ]);

        return redirect()->route('admin.products.edit', [
            'product' => $product,
            'tab' => 'colorways',
        ]);
    }

    public function edit(Request $request, Product $product): Response
    {
        $product->load([
            'category',
            'colorways.variants.inventory',
            'colorways.images',
        ]);

        return Inertia::render('admin/products/edit', [
            'product' => AdminProductResource::make($product)->resolve(),
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

    public function storeColorway(StoreColorwayRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();

        $this->products->createColorway($product, [
            'colorway_code' => $validated['colorway_code'],
            'color_name' => $validated['color_name'],
            'discount_price' => $validated['discount_price'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'sizes' => $validated['sizes'],
        ]);

        return redirect()->route('admin.products.edit', $product);
    }

    public function updateColorway(
        UpdateColorwayRequest $request,
        ProductColorway $colorway,
    ): RedirectResponse {
        $this->products->updateColorway($colorway, $request->validated());

        return redirect()->route('admin.products.edit', $colorway->product);
    }

    public function destroyColorway(ProductColorway $colorway): RedirectResponse
    {
        $product = $colorway->product;
        $this->products->deleteColorway($colorway);

        return redirect()->route('admin.products.edit', $product);
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
        foreach ($product->colorways as $colorway) {
            $primary = $colorway->images->firstWhere('is_primary', true)
                ?? $colorway->images->first();

            if ($primary instanceof ProductImage) {
                return $primary->image_url;
            }
        }

        return null;
    }

    private function productTotalStock(Product $product): int
    {
        return (int) $product->colorways->sum(
            fn (ProductColorway $colorway) => $colorway->variants->sum(
                fn ($variant) => $variant->inventory?->availableQuantity() ?? 0,
            ),
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
