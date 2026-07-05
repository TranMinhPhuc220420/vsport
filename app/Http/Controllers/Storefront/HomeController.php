<?php

namespace App\Http\Controllers\Storefront;

use App\Data\HomeStructuredData;
use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use App\Http\Resources\BlogPostSummaryResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductSummaryResource;
use App\Services\Blog\BlogCatalogService;
use App\Services\Catalog\ProductCatalogService;
use App\Services\Site\HomepageSettingsService;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private readonly ProductCatalogService $catalog,
        private readonly HomepageSettingsService $homepage,
        private readonly BlogCatalogService $blogCatalog,
    ) {}

    public function index(): Response
    {
        $categories = $this->catalog->topLevelCategories();

        $featured = ProductSummaryResource::collection($this->catalog->featured(8));
        $newArrivals = ProductSummaryResource::collection($this->catalog->newArrivals(8));
        $bestSellers = ProductSummaryResource::collection($this->catalog->bestSellers(8));
        $categoriesResource = CategoryResource::collection($categories);

        return Inertia::render('storefront/home', [
            'featuredProducts' => [
                'data' => array_values($featured->resolve()),
            ],
            'newArrivals' => [
                'data' => array_values($newArrivals->resolve()),
            ],
            'bestSellers' => [
                'data' => array_values($bestSellers->resolve()),
            ],
            'categories' => [
                'data' => array_values($categoriesResource->resolve()),
            ],
            'campaigns' => array_map(
                fn ($campaign) => $campaign->toArray(),
                $this->homepage->campaigns(),
            ),
            'featuredPosts' => [
                'data' => BlogPostSummaryResource::collection(
                    $this->blogCatalog->featuredForHomepage(),
                )->resolve(),
            ],
            'seo' => PageSeo::forHome()->toArray(),
            'structuredData' => HomeStructuredData::schemas(),
        ]);
    }
}
