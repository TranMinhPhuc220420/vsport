<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Data\ProductListFilters;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductSummaryResource;
use App\Models\Category;
use App\Services\Catalog\ProductCatalogService;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProductListingController extends Controller
{
    public function __construct(
        private readonly ProductCatalogService $catalog,
    ) {}

    public function index(ProductIndexRequest $request, string $category): Response
    {
        $categoryModel = $this->catalog->findCategoryBySlug($category);

        if ($categoryModel === null) {
            throw new NotFoundHttpException;
        }

        $categoryModel->loadMissing('parent');

        $rootSlug = $categoryModel->parent_id && $categoryModel->parent
            ? $categoryModel->parent->slug
            : $categoryModel->slug;

        $root = $this->catalog->findCategoryBySlug($rootSlug);

        if ($root === null) {
            throw new NotFoundHttpException;
        }

        $filters = new ProductListFilters(
            category: $category,
            gender: null,
            sort: $request->sort(),
            perPage: $request->perPage(),
        );

        $products = $this->catalog->paginateList($filters);
        $page = $request->integer('page', 1);

        return Inertia::render('storefront/products/index', [
            'products' => ProductSummaryResource::collection($products),
            'filters' => [
                'category' => $category,
                'sort' => $request->sort(),
                'activeDepartment' => $root->slug,
            ],
            'categoryMeta' => [
                'name' => $categoryModel->name,
                'slug' => $category,
                'breadcrumb' => $this->breadcrumb($categoryModel),
            ],
            'seo' => PageSeo::forCategory(
                $categoryModel->name,
                $category,
                $page,
                $products->previousPageUrl(),
                $products->nextPageUrl(),
            )->toArray(),
            'filterOptions' => [
                'departments' => CategoryResource::collection(
                    $this->catalog->topLevelCategories(),
                )->resolve(),
                'subCategories' => CategoryResource::collection(
                    $root->children,
                )->resolve(),
            ],
        ]);
    }

    /**
     * @return list<array{name: string, slug: string}>
     */
    private function breadcrumb(Category $category): array
    {
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
