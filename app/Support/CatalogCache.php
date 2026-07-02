<?php

namespace App\Support;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CatalogCache
{
    public const TREE_KEY = 'catalog.categories.tree';

    public const SLUG_PREFIX = 'catalog.categories.slug.';

    public static function forget(): void
    {
        Cache::forget(self::TREE_KEY);

        Category::query()->pluck('slug')->each(
            fn (string $slug) => Cache::forget(self::SLUG_PREFIX.$slug),
        );
    }
}
