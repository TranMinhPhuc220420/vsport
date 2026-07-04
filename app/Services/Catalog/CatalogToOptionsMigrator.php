<?php

namespace App\Services\Catalog;

use App\Enums\OptionDisplayType;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Models\ProductVariant;
use App\Support\ColorSwatch;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CatalogToOptionsMigrator
{
    /**
     * Migrate legacy colorway/size data to the product options model.
     */
    public function migrate(): void
    {
        if (! $this->legacySchemaExists()) {
            return;
        }

        DB::transaction(function (): void {
            Product::query()->each(fn (Product $product) => $this->migrateProduct($product));
        });
    }

    public function legacySchemaExists(): bool
    {
        return \Schema::hasTable('product_colorways')
            && \Schema::hasColumn('product_variants', 'colorway_id');
    }

    private function migrateProduct(Product $product): void
    {
        if ($product->options()->exists()) {
            return;
        }

        $colorways = DB::table('product_colorways')
            ->where('product_id', $product->id)
            ->orderBy('id')
            ->get();

        if ($colorways->isEmpty()) {
            return;
        }

        $hasCustomizable = $colorways->contains(fn ($row) => (bool) $row->is_customizable);

        $product->update(['is_customizable' => $hasCustomizable]);

        $colorOption = ProductOption::query()->create([
            'product_id' => $product->id,
            'name' => 'Color',
            'position' => 0,
            'display_type' => OptionDisplayType::Swatch,
            'is_required' => true,
            'drives_gallery' => true,
        ]);

        $sizeValues = DB::table('product_variants')
            ->whereIn('colorway_id', $colorways->pluck('id'))
            ->pluck('size_val')
            ->unique()
            ->sort()
            ->values();

        $sizeOption = null;
        $sizeValueMap = [];

        if ($sizeValues->isNotEmpty()) {
            $sizeOption = ProductOption::query()->create([
                'product_id' => $product->id,
                'name' => 'Size',
                'position' => 1,
                'display_type' => OptionDisplayType::Button,
                'is_required' => true,
                'drives_gallery' => false,
            ]);

            foreach ($sizeValues as $index => $size) {
                $sizeValueMap[$size] = ProductOptionValue::query()->create([
                    'option_id' => $sizeOption->id,
                    'value' => $size,
                    'slug' => Str::slug($size),
                    'sort_order' => $index,
                ]);
            }
        }

        $colorValueMap = [];

        foreach ($colorways as $index => $colorway) {
            $colorValue = ProductOptionValue::query()->create([
                'option_id' => $colorOption->id,
                'value' => $colorway->color_name,
                'slug' => Str::slug($colorway->colorway_code.'-'.$colorway->color_name),
                'swatch_hex' => ColorSwatch::fromColorName($colorway->color_name),
                'sort_order' => $index,
                'sale_price' => $colorway->discount_price,
            ]);

            $colorValueMap[$colorway->id] = $colorValue;

            ProductImage::query()
                ->where('colorway_id', $colorway->id)
                ->update(['option_value_id' => $colorValue->id]);

            DB::table('product_sustainability_materials')
                ->where('colorway_id', $colorway->id)
                ->update(['product_id' => $product->id]);

            DB::table('nike_by_you_options')
                ->where('colorway_id', $colorway->id)
                ->update(['product_id' => $product->id]);
        }

        foreach ($colorways as $colorway) {
            $colorValue = $colorValueMap[$colorway->id];
            $variants = DB::table('product_variants')
                ->where('colorway_id', $colorway->id)
                ->get();

            foreach ($variants as $variant) {
                DB::table('product_variants')
                    ->where('id', $variant->id)
                    ->update(['product_id' => $product->id]);

                $valueIds = [$colorValue->id];

                if ($sizeOption !== null && isset($sizeValueMap[$variant->size_val])) {
                    $valueIds[] = $sizeValueMap[$variant->size_val]->id;
                }

                $variantModel = ProductVariant::query()->find($variant->id);

                if ($variantModel !== null) {
                    $variantModel->optionValues()->sync($valueIds);
                }
            }
        }
    }
}
