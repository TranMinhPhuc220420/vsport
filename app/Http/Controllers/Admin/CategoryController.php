<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\CatalogCache;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $scope = $request->string('scope')->toString();
        if (! in_array($scope, ['all', 'roots', 'children'], true)) {
            $scope = 'all';
        }

        $allCategories = Category::query()
            ->with('parent')
            ->withCount(['products', 'children'])
            ->orderBy('name')
            ->get();

        $stats = [
            'total' => $allCategories->count(),
            'roots' => $allCategories->whereNull('parent_id')->count(),
            'missingImages' => $allCategories
                ->whereNull('parent_id')
                ->whereNull('image_path')
                ->count(),
        ];

        $categories = $allCategories;

        if ($search !== '') {
            $needle = mb_strtolower($search);

            $matchingIds = $allCategories
                ->filter(function (Category $category) use ($needle): bool {
                    $slug = mb_strtolower($category->slug);
                    $name = mb_strtolower($category->name);

                    $slugMatches = $slug === $needle
                        || str_starts_with($slug, "{$needle}-")
                        || str_contains($slug, "-{$needle}-")
                        || str_ends_with($slug, "-{$needle}");

                    $nameMatches = preg_match('/\b'.preg_quote($needle, '/').'/u', $name) === 1;

                    return $slugMatches || $nameMatches;
                })
                ->flatMap(function (Category $category) use ($allCategories): array {
                    $ids = [$category->id];

                    if ($category->parent_id !== null) {
                        $ids[] = $category->parent_id;
                    }

                    $childIds = $allCategories
                        ->where('parent_id', $category->id)
                        ->pluck('id')
                        ->all();

                    return [...$ids, ...$childIds];
                })
                ->unique()
                ->values()
                ->all();

            $categories = $allCategories->whereIn('id', $matchingIds);
        }

        if ($scope === 'roots') {
            $categories = $categories->whereNull('parent_id');
        } elseif ($scope === 'children') {
            $categories = $categories->whereNotNull('parent_id');
        }

        return Inertia::render('admin/categories/index', [
            'categories' => [
                'data' => $categories->map(fn (Category $category) => [
                    ...CategoryResource::make($category)->resolve(),
                    'productsCount' => $category->products_count,
                    'childrenCount' => $category->children_count,
                    'parentName' => $category->parent?->name,
                ])->values()->all(),
            ],
            'stats' => $stats,
            'filters' => [
                'search' => $search !== '' ? $search : null,
                'scope' => $scope,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $defaultParentId = $request->integer('parent_id') ?: null;

        if ($defaultParentId !== null) {
            $isValidParent = Category::query()
                ->whereKey($defaultParentId)
                ->whereNull('parent_id')
                ->exists();

            if (! $isValidParent) {
                $defaultParentId = null;
            }
        }

        return Inertia::render('admin/categories/create', [
            'parentCategories' => $this->parentOptions(),
            'defaultParentId' => $defaultParentId,
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
        $category->load([
            'optionTemplates',
            'parent',
            'children' => fn ($query) => $query
                ->orderBy('name')
                ->withCount('products'),
        ]);
        $category->loadCount(['products', 'children']);

        return Inertia::render('admin/categories/edit', [
            'category' => [
                ...CategoryResource::make($category)->resolve(),
                'productsCount' => $category->products_count,
                'childrenCount' => $category->children_count,
                'parentName' => $category->parent?->name,
            ],
            'children' => $category->children->map(fn (Category $child) => [
                ...CategoryResource::make($child)->resolve(),
                'productsCount' => $child->products_count,
            ])->values()->all(),
            'optionTemplates' => $category->optionTemplates->map(fn ($template) => [
                'id' => $template->id,
                'name' => $template->name,
                'position' => $template->position,
                'displayType' => $template->display_type->value,
                'isRequired' => $template->is_required,
                'drivesGallery' => $template->drives_gallery,
                'defaultValues' => $template->default_values ?? [],
                'metadata' => $template->metadata,
            ]),
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
