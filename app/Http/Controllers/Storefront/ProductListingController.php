<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Data\ProductListFilters;
use App\Enums\ProductGender;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductSummaryResource;
use App\Services\Catalog\ProductCatalogService;
use Inertia\Inertia;
use Inertia\Response;

class ProductListingController extends Controller
{
    public function __construct(
        private readonly ProductCatalogService $catalog,
    ) {}

    public function index(ProductIndexRequest $request, string $category): Response
    {
        $categoryModel = $this->catalog->findCategoryBySlug($category);

        $filters = new ProductListFilters(
            category: $category,
            gender: $request->validated('gender'),
            sort: $request->sort(),
            perPage: $request->perPage(),
        );

        $products = $this->catalog->paginateList($filters);

        $categoryName = $categoryModel?->name ?? ucfirst($category);

        return Inertia::render('storefront/products/index', [
            'products' => ProductSummaryResource::collection($products),
            'filters' => [
                'category' => $category,
                'gender' => $request->validated('gender'),
                'sort' => $request->sort(),
            ],
            'categoryMeta' => [
                'name' => $categoryName,
                'slug' => $category,
                'breadcrumb' => $this->breadcrumb($categoryModel),
            ],
            'seo' => PageSeo::forCategory($categoryName, $category)->toArray(),
            'filterOptions' => [
                'genders' => array_column(ProductGender::cases(), 'value'),
                'childCategories' => CategoryResource::collection(
                    $categoryModel?->children ?? collect(),
                )->resolve()['data'] ?? [],
            ],
        ]);
    }

    /**
     * @return list<array{name: string, slug: string}>
     */
    private function breadcrumb(?\App\Models\Category $category): array
    {
        if ($category === null) {
            return [];
        }

        $trail = [];

        if ($category->parent_id !== null) {
            $category->loadMissing('parent');

            if ($category->parent) {
                $trail[] = [
                    'name' => $category->parent->name,
                    'slug' => $category->parent->slug,
                ];
            }
        }

        $trail[] = [
            'name' => $category->name,
            'slug' => $category->slug,
        ];

        return $trail;
    }
}
