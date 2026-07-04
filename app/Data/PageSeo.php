<?php

namespace App\Data;

use App\Models\Product;

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
    ) {}

    /**
     * @return array{
     *     title: string,
     *     description: string,
     *     canonical: string,
     *     ogImage: string|null,
     *     robots: string|null,
     *     ogType: string,
     *     ogUrl: string
     * }
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'canonical' => $this->canonical,
            'ogImage' => $this->ogImage,
            'robots' => $this->robots,
            'ogType' => $this->ogType,
            'ogUrl' => $this->ogUrl ?? $this->canonical,
        ];
    }

    public static function forHome(): self
    {
        $app = config('app.name', 'VSport');

        return new self(
            title: $app,
            description: __('seo.home.description', ['app' => $app]),
            canonical: route('home'),
        );
    }

    public static function forCategory(string $name, string $slug): self
    {
        $app = config('app.name', 'VSport');

        return new self(
            title: __('seo.category.title', ['name' => $name, 'app' => $app]),
            description: __('seo.category.description', ['name' => $name, 'app' => $app]),
            canonical: route('category.show', $slug),
        );
    }

    public static function forSearch(string $query): self
    {
        $app = config('app.name', 'VSport');

        if ($query === '') {
            return new self(
                title: __('seo.search.title', ['app' => $app]),
                description: __('seo.search.description', ['app' => $app]),
                canonical: route('search.index'),
            );
        }

        return new self(
            title: __('seo.search.title_with_query', ['query' => $query, 'app' => $app]),
            description: __('seo.search.description_with_query', ['query' => $query, 'app' => $app]),
            canonical: route('search.index', ['q' => $query]),
        );
    }

    public static function forProduct(Product $product, ?string $ogImage = null): self
    {
        $app = config('app.name', 'VSport');
        $description = self::truncate($product->description)
            ?: __('seo.product.fallback_description', ['name' => $product->name, 'app' => $app]);

        return new self(
            title: __('seo.product.title', ['name' => $product->name, 'app' => $app]),
            description: $description,
            canonical: route('products.show', $product->slug),
            ogImage: $ogImage,
            ogType: 'product',
        );
    }

    public static function forLegal(string $page, string $routeName): self
    {
        $app = config('app.name', 'VSport');

        return new self(
            title: __('seo.legal.title', ['page' => $page, 'app' => $app]),
            description: __('seo.legal.description', ['page' => $page, 'app' => $app]),
            canonical: route($routeName),
        );
    }

    public static function forPrivate(string $title, string $canonical): self
    {
        $app = config('app.name', 'VSport');

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
}
