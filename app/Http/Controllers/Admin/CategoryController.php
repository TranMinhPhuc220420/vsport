<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\CatalogCache;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        $categories = Category::query()
            ->with('parent')
            ->withCount(['products', 'children'])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/categories/index', [
            'categories' => [
                'data' => $categories->map(fn (Category $category) => [
                    ...CategoryResource::make($category)->resolve(),
                    'productsCount' => $category->products_count,
                    'childrenCount' => $category->children_count,
                    'parentName' => $category->parent?->name,
                ])->values()->all(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/categories/create', [
            'parentCategories' => $this->parentOptions(),
        ]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        Category::query()->create($request->validated());

        CatalogCache::forget();

        return redirect()->route('admin.categories.index');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('admin/categories/edit', [
            'category' => CategoryResource::make($category)->resolve(),
            'parentCategories' => $this->parentOptions($category->id),
        ]);
    }

    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $category->update($request->validated());

        CatalogCache::forget();

        return redirect()->route('admin.categories.index');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            return back()->withErrors([
                'category' => 'Cannot delete a category that has products.',
            ]);
        }

        if ($category->children()->exists()) {
            return back()->withErrors([
                'category' => 'Cannot delete a category that has child categories.',
            ]);
        }

        $category->delete();

        CatalogCache::forget();

        return redirect()->route('admin.categories.index');
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    private function parentOptions(?int $excludeId = null): array
    {
        return Category::query()
            ->when($excludeId, fn ($query) => $query->where('id', '!=', $excludeId))
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
            ])
            ->all();
    }
}
