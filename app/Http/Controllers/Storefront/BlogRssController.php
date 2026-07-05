<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Services\Blog\BlogCatalogService;
use App\Services\ProductImageStorage;
use Illuminate\Http\Response;

class BlogRssController extends Controller
{
    public function __construct(
        private readonly BlogCatalogService $catalog,
        private readonly ProductImageStorage $storage,
    ) {}

    public function __invoke(): Response
    {
        $posts = $this->catalog->latestForFeed();

        return response()->view('blog-feed', [
            'posts' => $posts,
            'storage' => $this->storage,
            'siteName' => config('app.name', 'Zova Sport'),
            'feedUrl' => route('blog.feed'),
            'blogUrl' => route('blog.index'),
        ], 200, [
            'Content-Type' => 'application/rss+xml; charset=UTF-8',
        ]);
    }
}
