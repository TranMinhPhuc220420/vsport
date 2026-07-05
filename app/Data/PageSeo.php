<?php

namespace App\Data;

use App\Models\BlogPost;
use App\Models\Product;
use App\Services\Admin\StoreSettingsService;

readonly class PageSeo
{
    public function __construct(
        public string $title,
        public string $description,
        public string $canonical,
        public ?string $ogImage = null,
        public ?string $robots = null,
        public string $ogType = 'website',
        public ?string $ogUrl = null,
        public ?string $articlePublishedTime = null,
        public ?string $articleModifiedTime = null,
        public ?string $articleAuthor = null,
        public ?string $prevUrl = null,
        public ?string $nextUrl = null,
        public ?string $rssAlternateUrl = null,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'canonical' => $this->canonical,
            'ogImage' => $this->ogImage ?? self::defaultOgImage(),
            'robots' => $this->robots,
            'ogType' => $this->ogType,
            'ogUrl' => $this->ogUrl ?? $this->canonical,
            'siteName' => config('app.name', 'Zova Sport'),
            'articlePublishedTime' => $this->articlePublishedTime,
            'articleModifiedTime' => $this->articleModifiedTime,
            'articleAuthor' => $this->articleAuthor,
            'prevUrl' => $this->prevUrl,
            'nextUrl' => $this->nextUrl,
            'rssAlternateUrl' => $this->rssAlternateUrl,
        ];
    }

    public static function defaultOgImage(): ?string
    {
        $settings = app(StoreSettingsService::class)->profile();

        if (! empty($settings['logoWideUrl'])) {
            return $settings['logoWideUrl'];
        }

        if (file_exists(public_path('og-default.jpg'))) {
            return url('/og-default.jpg');
        }

        if (file_exists(public_path('favicon.ico'))) {
            return url('/favicon.ico');
        }

        return null;
    }

    public static function forHome(): self
    {
        $app = config('app.name', 'Zova Sport');

        return new self(
            title: $app,
            description: __('seo.home.description', ['app' => $app]),
            canonical: route('home'),
            ogImage: self::defaultOgImage(),
        );
    }

    public static function forCategory(
        string $name,
        string $slug,
        int $page = 1,
        ?string $prevUrl = null,
        ?string $nextUrl = null,
    ): self {
        $app = config('app.name', 'Zova Sport');

        return new self(
            title: __('seo.category.title', ['name' => $name, 'app' => $app]),
            description: __('seo.category.description', ['name' => $name, 'app' => $app]),
            canonical: route('category.show', $slug),
            ogImage: self::defaultOgImage(),
            robots: self::robotsForPage($page),
            prevUrl: $prevUrl,
            nextUrl: $nextUrl,
        );
    }

    public static function forSearch(
        string $query,
        int $page = 1,
        ?string $prevUrl = null,
        ?string $nextUrl = null,
    ): self {
        $app = config('app.name', 'Zova Sport');

        if ($query === '') {
            return new self(
                title: __('seo.search.title', ['app' => $app]),
                description: __('seo.search.description', ['app' => $app]),
                canonical: route('search.index'),
                ogImage: self::defaultOgImage(),
                robots: self::robotsForPage($page),
                prevUrl: $prevUrl,
                nextUrl: $nextUrl,
            );
        }

        return new self(
            title: __('seo.search.title_with_query', ['query' => $query, 'app' => $app]),
            description: __('seo.search.description_with_query', ['query' => $query, 'app' => $app]),
            canonical: route('search.index', ['q' => $query]),
            ogImage: self::defaultOgImage(),
            robots: 'noindex, follow',
            prevUrl: $prevUrl,
            nextUrl: $nextUrl,
        );
    }

    public static function forProduct(Product $product, ?string $ogImage = null): self
    {
        $app = config('app.name', 'Zova Sport');
        $description = self::truncate($product->description)
            ?: __('seo.product.fallback_description', ['name' => $product->name, 'app' => $app]);

        return new self(
            title: __('seo.product.title', ['name' => $product->name, 'app' => $app]),
            description: $description,
            canonical: route('products.show', $product->slug),
            ogImage: $ogImage ?? self::defaultOgImage(),
            ogType: 'product',
        );
    }

    public static function forLegal(string $page, string $routeName): self
    {
        $app = config('app.name', 'Zova Sport');

        return new self(
            title: __('seo.legal.title', ['page' => $page, 'app' => $app]),
            description: __('seo.legal.description', ['page' => $page, 'app' => $app]),
            canonical: route($routeName),
            ogImage: self::defaultOgImage(),
        );
    }

    public static function forBlogIndex(
        int $page = 1,
        ?string $prevUrl = null,
        ?string $nextUrl = null,
    ): self {
        $app = config('app.name', 'Zova Sport');

        return new self(
            title: __('seo.blog.index_title', ['app' => $app]),
            description: __('seo.blog.index_description', ['app' => $app]),
            canonical: route('blog.index'),
            ogImage: self::defaultOgImage(),
            ogType: 'website',
            robots: self::robotsForPage($page),
            prevUrl: $prevUrl,
            nextUrl: $nextUrl,
            rssAlternateUrl: route('blog.feed'),
        );
    }

    public static function forBlogCategory(
        string $name,
        string $slug,
        int $page = 1,
        ?string $prevUrl = null,
        ?string $nextUrl = null,
    ): self {
        $app = config('app.name', 'Zova Sport');

        return new self(
            title: __('seo.blog.category_title', ['name' => $name, 'app' => $app]),
            description: __('seo.blog.category_description', ['name' => $name, 'app' => $app]),
            canonical: route('blog.index', ['category' => $slug]),
            ogImage: self::defaultOgImage(),
            ogType: 'website',
            robots: self::robotsForPage($page),
            prevUrl: $prevUrl,
            nextUrl: $nextUrl,
            rssAlternateUrl: route('blog.feed'),
        );
    }

    public static function forBlogTag(
        string $name,
        string $slug,
        int $page = 1,
        ?string $prevUrl = null,
        ?string $nextUrl = null,
    ): self {
        $app = config('app.name', 'Zova Sport');

        return new self(
            title: __('seo.blog.tag_title', ['name' => $name, 'app' => $app]),
            description: __('seo.blog.tag_description', ['name' => $name, 'app' => $app]),
            canonical: route('blog.index', ['tag' => $slug]),
            ogImage: self::defaultOgImage(),
            ogType: 'website',
            robots: self::robotsForPage($page),
            prevUrl: $prevUrl,
            nextUrl: $nextUrl,
            rssAlternateUrl: route('blog.feed'),
        );
    }

    public static function forBlogPost(BlogPost $post, ?string $ogImage = null): self
    {
        $app = config('app.name', 'Zova Sport');
        $title = $post->meta_title ?: $post->title;
        $description = self::truncate($post->meta_description ?: $post->excerpt);

        return new self(
            title: __('seo.blog.post_title', ['title' => $title, 'app' => $app]),
            description: $description,
            canonical: route('blog.show', $post->slug),
            ogImage: $ogImage ?? self::defaultOgImage(),
            ogType: 'article',
            articlePublishedTime: $post->published_at?->toAtomString(),
            articleModifiedTime: $post->updated_at?->toAtomString(),
            articleAuthor: $post->author_name,
            rssAlternateUrl: route('blog.feed'),
        );
    }

    public static function forPrivate(string $title, string $canonical): self
    {
        $app = config('app.name', 'Zova Sport');

        return new self(
            title: "{$title} | {$app}",
            description: '',
            canonical: $canonical,
            robots: 'noindex, nofollow',
        );
    }

    public static function truncate(?string $text, int $limit = 160): string
    {
        if ($text === null || trim($text) === '') {
            return '';
        }

        $normalized = preg_replace('/\s+/', ' ', trim($text)) ?? '';

        if (strlen($normalized) <= $limit) {
            return $normalized;
        }

        return rtrim(substr($normalized, 0, $limit - 3)).'...';
    }

    private static function robotsForPage(int $page): ?string
    {
        return $page > 1 ? 'noindex, follow' : null;
    }
}
