<?php

namespace App\Services\Catalog;

use App\Enums\ProductGender;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductColorway;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductAdminService
{
    /**
     * @param  array{
     *     style_code: string,
     *     name: string,
     *     slug: string,
     *     description?: string|null,
     *     category_id: int,
     *     sub_title?: string|null,
     *     base_price: float|string,
     *     gender: string
     * }  $productData
     * @param  array{
     *     colorway_code: string,
     *     color_name: string,
     *     discount_price?: float|string|null,
     *     sizes: list<string>
     * }  $colorwayData
     */
    public function createProduct(array $productData, array $colorwayData): Product
    {
        return DB::transaction(function () use ($productData, $colorwayData): Product {
            $product = Product::query()->create([
                ...$productData,
                'gender' => ProductGender::from($productData['gender']),
            ]);

            $this->createColorwayWithVariants($product, $colorwayData);

            return $product->load([
                'category',
                'colorways.variants.inventory',
                'colorways.images',
            ]);
        });
    }

    /**
     * @param  array{
     *     style_code: string,
     *     name: string,
     *     slug: string,
     *     description?: string|null,
     *     category_id: int,
     *     sub_title?: string|null,
     *     base_price: float|string,
     *     gender: string
     * }  $productData
     */
    public function updateProduct(Product $product, array $productData): Product
    {
        $product->update([
            ...$productData,
            'gender' => ProductGender::from($productData['gender']),
        ]);

        return $product->fresh([
            'category',
            'colorways.variants.inventory',
            'colorways.images',
        ]);
    }

    /**
     * @param  array{
     *     colorway_code: string,
     *     color_name: string,
     *     discount_price?: float|string|null,
     *     is_active?: bool,
     *     sizes: list<string>
     * }  $colorwayData
     */
    public function createColorway(Product $product, array $colorwayData): ProductColorway
    {
        return DB::transaction(function () use ($product, $colorwayData): ProductColorway {
            return $this->createColorwayWithVariants($product, $colorwayData);
        });
    }

    /**
     * @param  array{
     *     color_name: string,
     *     discount_price?: float|string|null,
     *     is_active?: bool
     * }  $data
     */
    public function updateColorway(ProductColorway $colorway, array $data): ProductColorway
    {
        $colorway->update([
            'color_name' => $data['color_name'],
            'discount_price' => $data['discount_price'] ?? null,
            'is_active' => $data['is_active'] ?? $colorway->is_active,
        ]);

        return $colorway->fresh(['variants.inventory', 'images']);
    }

    public function deleteColorway(ProductColorway $colorway): void
    {
        $colorway->delete();
    }

    /**
     * @param  list<array{size: string, quantity: int}>  $variants
     */
    public function syncColorwayVariants(ProductColorway $colorway, array $variants): ProductColorway
    {
        return DB::transaction(function () use ($colorway, $variants): ProductColorway {
            $colorway->loadMissing('product', 'variants.inventory');

            $incomingSizes = collect($variants)->pluck('size')->all();
            $existingBySize = $colorway->variants->keyBy('size_val');

            foreach ($colorway->variants as $variant) {
                if (! in_array($variant->size_val, $incomingSizes, true)) {
                    $variant->delete();
                }
            }

            foreach ($variants as $row) {
                $variant = $existingBySize->get($row['size']);

                if ($variant === null) {
                    $variant = $this->createVariant($colorway, $row['size']);
                }

                Inventory::query()->updateOrCreate(
                    ['variant_id' => $variant->id],
                    ['quantity' => $row['quantity'], 'reserved_quantity' => 0],
                );
            }

            return $colorway->fresh(['variants.inventory', 'images']);
        });
    }

    public function updateInventoryQuantity(ProductVariant $variant, int $quantity): Inventory
    {
        return Inventory::query()->updateOrCreate(
            ['variant_id' => $variant->id],
            ['quantity' => $quantity, 'reserved_quantity' => 0],
        );
    }

    /**
     * @param  list<array{id: int, quantity: int}>  $variants
     */
    public function batchUpdateColorwayInventory(ProductColorway $colorway, array $variants): ProductColorway
    {
        return DB::transaction(function () use ($colorway, $variants): ProductColorway {
            $colorway->loadMissing('variants');

            $allowedIds = $colorway->variants->pluck('id')->all();

            foreach ($variants as $row) {
                if (! in_array($row['id'], $allowedIds, true)) {
                    continue;
                }

                Inventory::query()->updateOrCreate(
                    ['variant_id' => $row['id']],
                    ['quantity' => $row['quantity'], 'reserved_quantity' => 0],
                );
            }

            return $colorway->fresh(['variants.inventory', 'images']);
        });
    }

    /**
     * @param  array{
     *     colorway_code: string,
     *     color_name: string,
     *     discount_price?: float|string|null,
     *     is_active?: bool,
     *     sizes: list<string>
     * }  $colorwayData
     */
    private function createColorwayWithVariants(Product $product, array $colorwayData): ProductColorway
    {
        $fullStyleCode = "{$product->style_code}-{$colorwayData['colorway_code']}";

        $colorway = ProductColorway::query()->create([
            'product_id' => $product->id,
            'colorway_code' => $colorwayData['colorway_code'],
            'full_style_code' => $fullStyleCode,
            'color_name' => $colorwayData['color_name'],
            'discount_price' => $colorwayData['discount_price'] ?? null,
            'is_customizable' => false,
            'is_active' => $colorwayData['is_active'] ?? true,
        ]);

        foreach ($colorwayData['sizes'] as $size) {
            $variant = $this->createVariant($colorway, $size);

            Inventory::query()->create([
                'variant_id' => $variant->id,
                'quantity' => 0,
                'reserved_quantity' => 0,
            ]);
        }

        return $colorway;
    }

    private function createVariant(ProductColorway $colorway, string $size): ProductVariant
    {
        $colorway->loadMissing('product');

        $sku = Str::slug("{$colorway->product->style_code}-{$colorway->colorway_code}-{$size}", '-');

        return ProductVariant::query()->create([
            'colorway_id' => $colorway->id,
            'size_val' => $size,
            'sku' => $sku,
            'additional_price' => 0,
        ]);
    }
}
