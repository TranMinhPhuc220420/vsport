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
    ) {}

    /**
     * @return array{title: string, description: string, canonical: string, ogImage: string|null, robots: string|null}
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'canonical' => $this->canonical,
            'ogImage' => $this->ogImage,
            'robots' => $this->robots,
        ];
    }

    public static function forHome(): self
    {
        return new self(
            title: config('app.name', 'VSport'),
            description: 'Shop sports footwear and apparel at VSport. Fast checkout with cash on delivery.',
            canonical: route('home'),
        );
    }

    public static function forCategory(string $name, string $slug): self
    {
        return new self(
            title: "{$name} | ".config('app.name', 'VSport'),
            description: "Shop {$name} shoes and gear at VSport.",
            canonical: route('category.show', $slug),
        );
    }

    public static function forSearch(string $query): self
    {
        $app = config('app.name', 'VSport');

        if ($query === '') {
            return new self(
                title: "Search | {$app}",
                description: "Search products at {$app}.",
                canonical: route('search.index'),
            );
        }

        return new self(
            title: "Search: {$query} | {$app}",
            description: "Search results for \"{$query}\" at {$app}.",
            canonical: route('search.index', ['q' => $query]),
        );
    }

    public static function forProduct(Product $product, ?string $ogImage = null): self
    {
        $description = self::truncate($product->description)
            ?: "Shop {$product->name} at VSport.";

        return new self(
            title: "{$product->name} | ".config('app.name', 'VSport'),
            description: $description,
            canonical: route('products.show', $product->slug),
            ogImage: $ogImage,
        );
    }

    public static function forLegal(string $page, string $routeName): self
    {
        $app = config('app.name', 'VSport');

        return new self(
            title: "{$page} | {$app}",
            description: "{$page} — {$app}",
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
