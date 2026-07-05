<?php

namespace App\Http\Controllers\Storefront;

use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductSearchRequest;
use App\Http\Resources\ProductSummaryResource;
use App\Services\Catalog\ProductCatalogService;
use Inertia\Inertia;
use Inertia\Response;

class ProductSearchController extends Controller
{
    public function __construct(
        private readonly ProductCatalogService $catalog,
    ) {}

    public function index(ProductSearchRequest $request): Response
    {
        $query = $request->searchQuery();

        $page = $request->integer('page', 1);

        $products = $query === ''
            ? null
            : $this->catalog->paginateSearch($query, $request->sort(), $request->perPage());

        return Inertia::render('storefront/products/search', [
            'query' => $query !== '' ? $query : null,
            'products' => $products !== null
                ? ProductSummaryResource::collection($products)
                : null,
            'seo' => PageSeo::forSearch(
                $query,
                $page,
                $products?->previousPageUrl(),
                $products?->nextPageUrl(),
            )->toArray(),
            'sort' => $request->sort(),
        ]);
    }
}
