<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = [
            [
                'loc' => route('home'),
                'lastmod' => now()->toAtomString(),
            ],
        ];

        Category::query()
            ->orderBy('id')
            ->get(['slug', 'updated_at'])
            ->each(function (Category $category) use (&$urls): void {
                $urls[] = [
                    'loc' => route('category.show', $category->slug),
                    'lastmod' => $category->updated_at?->toAtomString(),
                ];
            });

        Product::query()
            ->orderBy('id')
            ->get(['slug', 'updated_at'])
            ->each(function (Product $product) use (&$urls): void {
                $urls[] = [
                    'loc' => route('products.show', $product->slug),
                    'lastmod' => $product->updated_at?->toAtomString(),
                ];
            });

        foreach (['legal.privacy', 'legal.shipping', 'legal.returns', 'legal.contact'] as $routeName) {
            $urls[] = [
                'loc' => route($routeName),
                'lastmod' => null,
            ];
        }

        $urls[] = [
            'loc' => route('blog.index'),
            'lastmod' => now()->toAtomString(),
        ];

        BlogPost::query()
            ->published()
            ->orderByDesc('published_at')
            ->get(['slug', 'updated_at'])
            ->each(function (BlogPost $post) use (&$urls): void {
                $urls[] = [
                    'loc' => route('blog.show', $post->slug),
                    'lastmod' => $post->updated_at?->toAtomString(),
                ];
            });

        return response()->view('sitemap', ['urls' => $urls], 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
