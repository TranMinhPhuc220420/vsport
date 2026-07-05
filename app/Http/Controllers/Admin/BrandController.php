<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBrandRequest;
use App\Http\Requests\Admin\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Services\Admin\AdminActivityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BrandController extends Controller
{
    public function __construct(
        private readonly AdminActivityService $activity,
    ) {}

    public function index(): Response
    {
        $brands = Brand::query()
            ->withCount('products')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/brands/index', [
            'brands' => [
                'data' => $brands->map(fn (Brand $brand) => [
                    ...BrandResource::make($brand)->resolve(),
                    'productsCount' => $brand->products_count,
                ])->values()->all(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/brands/create');
    }

    public function store(StoreBrandRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->resolveSlug($data['slug'], $data['name']);

        $brand = Brand::query()->create($data);

        $this->activity->log($request->user(), 'brands.store', $brand, request: $request);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.brand_created'),
        ]);

        return redirect()->route('admin.brands.index');
    }

    public function edit(Brand $brand): Response
    {
        return Inertia::render('admin/brands/edit', [
            'brand' => BrandResource::make($brand)->resolve(),
        ]);
    }

    public function update(UpdateBrandRequest $request, Brand $brand): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->resolveSlug($data['slug'], $data['name'], $brand->id);

        $brand->update($data);

        $this->activity->log($request->user(), 'brands.update', $brand, request: $request);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.brand_updated'),
        ]);

        return redirect()->route('admin.brands.index');
    }

    public function destroy(Brand $brand): RedirectResponse
    {
        if ($brand->products()->exists()) {
            return back()->withErrors([
                'brand' => __('messages.brand_has_products'),
            ]);
        }

        $this->activity->log(request()->user(), 'brands.destroy', $brand, request: request());

        $brand->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('messages.brand_deleted'),
        ]);

        return redirect()->route('admin.brands.index');
    }

    private function resolveSlug(?string $slug, string $name, ?int $ignoreId = null): string
    {
        $base = $slug !== null && trim($slug) !== '' ? $slug : Str::slug($name);
        $candidate = $base;
        $suffix = 1;

        while (
            Brand::query()
                ->where('slug', $candidate)
                ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $candidate = "{$base}-{$suffix}";
            $suffix++;
        }

        return $candidate;
    }
}
