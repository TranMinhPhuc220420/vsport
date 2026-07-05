<?php

namespace App\Http\Controllers\Storefront;

use App\Data\BlogPostStructuredData;
use App\Data\PageSeo;
use App\Http\Controllers\Controller;
use App\Http\Resources\BlogCategoryResource;
use App\Http\Resources\BlogPostResource;
use App\Http\Resources\BlogPostSummaryResource;
use App\Http\Resources\BlogTagResource;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Services\Blog\BlogCatalogService;
use App\Services\ProductImageStorage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BlogController extends Controller
{
    public function __construct(
        private readonly BlogCatalogService $catalog,
        private readonly ProductImageStorage $storage,
    ) {}

    public function index(Request $request): Response
    {
        $categorySlug = $request->string('category')->trim()->toString();
        $categorySlug = $categorySlug !== '' ? $categorySlug : null;

        $tagSlug = $request->string('tag')->trim()->toString();
        $tagSlug = $tagSlug !== '' ? $tagSlug : null;

        $posts = $this->catalog->paginatePublished($categorySlug, $tagSlug);

        $activeTag = $tagSlug !== null
            ? BlogTag::query()->where('slug', $tagSlug)->first()
            : null;

        $activeCategory = $categorySlug !== null
            ? BlogCategory::query()->where('slug', $categorySlug)->first()
            : null;

        $page = $request->integer('page', 1);

        $seo = match (true) {
            $activeTag !== null => PageSeo::forBlogTag(
                $activeTag->name,
                $activeTag->slug,
                $page,
                $posts->previousPageUrl(),
                $posts->nextPageUrl(),
            ),
            $activeCategory !== null => PageSeo::forBlogCategory(
                $activeCategory->name,
                $activeCategory->slug,
                $page,
                $posts->previousPageUrl(),
                $posts->nextPageUrl(),
            ),
            default => PageSeo::forBlogIndex(
                $page,
                $posts->previousPageUrl(),
                $posts->nextPageUrl(),
            ),
        };

        return Inertia::render('storefront/blog/index', [
            'posts' => [
                'data' => BlogPostSummaryResource::collection($posts->getCollection())->resolve(),
                'links' => [
                    'first' => $posts->url(1),
                    'last' => $posts->url($posts->lastPage()),
                    'prev' => $posts->previousPageUrl(),
                    'next' => $posts->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $posts->currentPage(),
                    'from' => $posts->firstItem(),
                    'last_page' => $posts->lastPage(),
                    'per_page' => $posts->perPage(),
                    'to' => $posts->lastItem(),
                    'total' => $posts->total(),
                ],
            ],
            'categories' => BlogCategoryResource::collection(
                BlogCategory::query()->orderBy('sort_order')->orderBy('name')->get(),
            )->resolve(),
            'filters' => [
                'category' => $categorySlug,
                'tag' => $tagSlug,
            ],
            'activeTag' => $activeTag !== null
                ? BlogTagResource::make($activeTag)->resolve()
                : null,
            'seo' => $seo->toArray(),
        ]);
    }

    public function show(string $slug): Response
    {
        $post = $this->catalog->findPublishedBySlug($slug);

        if ($post === null) {
            throw new NotFoundHttpException;
        }

        $relatedPosts = $this->catalog->relatedPosts($post);

        $featuredImage = $this->storage->urlFor(
            $post->featured_image_url,
            $post->featured_image_path,
        );

        return Inertia::render('storefront/blog/show', [
            'post' => BlogPostResource::make($post)->resolve(),
            'relatedPosts' => BlogPostSummaryResource::collection($relatedPosts)->resolve(),
            'seo' => PageSeo::forBlogPost($post, $featuredImage)->toArray(),
            'structuredData' => BlogPostStructuredData::forPost($post, $featuredImage),
        ]);
    }
}
