<?php

namespace App\Services\Wishlist;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Support\Collection;

class WishlistService
{
    public function resolveForUser(User $user): Wishlist
    {
        return Wishlist::query()->firstOrCreate(['user_id' => $user->id]);
    }

    /**
     * @return Collection<int, Product>
     */
    public function list(User $user): Collection
    {
        $wishlist = $this->resolveForUser($user);

        $productIds = $wishlist->items()
            ->orderByDesc('id')
            ->pluck('product_id');

        $products = Product::query()
            ->whereIn('id', $productIds)
            ->with(['options.values.images', 'variants.inventory'])
            ->get()
            ->keyBy('id');

        return $productIds
            ->map(fn (int $id) => $products->get($id))
            ->filter()
            ->values();
    }

    public function add(User $user, Product $product): void
    {
        $wishlist = $this->resolveForUser($user);

        $wishlist->items()->firstOrCreate(['product_id' => $product->id]);
    }

    public function remove(User $user, Product $product): void
    {
        $wishlist = $this->resolveForUser($user);

        $wishlist->items()->where('product_id', $product->id)->delete();
    }

    /**
     * @param  list<string>  $slugs
     */
    public function mergeSlugs(User $user, array $slugs): void
    {
        if ($slugs === []) {
            return;
        }

        $wishlist = $this->resolveForUser($user);

        $productIds = Product::query()->whereIn('slug', $slugs)->pluck('id');

        foreach ($productIds as $productId) {
            $wishlist->items()->firstOrCreate(['product_id' => $productId]);
        }
    }
}
