<?php

namespace App\Http\Controllers\Api;

use App\Data\ProductListFilters;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductIndexRequest;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductSummaryResource;
use App\Services\Catalog\ProductCatalogService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductCatalogService $catalog,
    ) {}

    public function index(ProductIndexRequest $request): AnonymousResourceCollection
    {
        $filters = new ProductListFilters(
            category: $request->validated('category'),
            gender: $request->validated('gender'),
            sort: $request->sort(),
            perPage: $request->perPage(),
        );

        $products = $this->catalog->paginateList($filters);

        return ProductSummaryResource::collection($products);
    }

    public function show(string $slug): ProductDetailResource
    {
        $product = $this->catalog->findBySlug($slug);

        return ProductDetailResource::make($product);
    }
}
