<?php

namespace App\Services\Catalog;

use App\Enums\OptionDisplayType;
use App\Models\Product;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Models\ProductVariant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductOptionService
{
    /**
     * @param  list<array{
     *     id?: int,
     *     name: string,
     *     position: int,
     *     displayType: string,
     *     isRequired?: bool,
     *     drivesGallery?: bool,
     *     metadata?: array<string, mixed>|null,
     *     values: list<array{
     *         id?: int,
     *         value: string,
     *         slug?: string,
     *         swatchHex?: string|null,
     *         sortOrder?: int,
     *         salePrice?: float|null,
     *         metadata?: array<string, mixed>|null,
     *     }>,
     * }>  $optionsPayload
     */
    public function syncOptions(Product $product, array $optionsPayload): Product
    {
        return DB::transaction(function () use ($product, $optionsPayload): Product {
            $incomingIds = collect($optionsPayload)->pluck('id')->filter()->all();
            $product->options()->whereNotIn('id', $incomingIds)->each(function (ProductOption $option): void {
                $option->delete();
            });

            foreach ($optionsPayload as $optionData) {
                $option = isset($optionData['id'])
                    ? $product->options()->findOrFail($optionData['id'])
                    : new ProductOption(['product_id' => $product->id]);

                $option->fill([
                    'name' => $optionData['name'],
                    'position' => $optionData['position'],
                    'display_type' => OptionDisplayType::from($optionData['displayType']),
                    'is_required' => $optionData['isRequired'] ?? true,
                    'drives_gallery' => $optionData['drivesGallery'] ?? false,
                    'metadata' => $optionData['metadata'] ?? null,
                ]);
                $option->save();

                $valueIds = collect($optionData['values'])->pluck('id')->filter()->all();
                $option->values()->whereNotIn('id', $valueIds)->delete();

                foreach ($optionData['values'] as $index => $valueData) {
                    $value = isset($valueData['id'])
                        ? $option->values()->findOrFail($valueData['id'])
                        : new ProductOptionValue(['option_id' => $option->id]);

                    $slug = $valueData['slug'] ?? Str::slug($valueData['value']);

                    $value->fill([
                        'value' => $valueData['value'],
                        'slug' => $slug,
                        'swatch_hex' => $valueData['swatchHex'] ?? null,
                        'sort_order' => $valueData['sortOrder'] ?? $index,
                        'sale_price' => $valueData['salePrice'] ?? null,
                        'metadata' => $valueData['metadata'] ?? null,
                    ]);
                    $value->save();
                }
            }

            return $product->fresh(['options.values']);
        });
    }

    public function generateVariants(Product $product): Collection
    {
        $product->loadMissing('options.values');

        $optionGroups = $product->options
            ->sortBy('position')
            ->map(fn (ProductOption $option) => $option->values->sortBy('sort_order')->values())
            ->filter(fn (Collection $values) => $values->isNotEmpty())
            ->values();

        if ($optionGroups->isEmpty()) {
            return collect();
        }

        $combinations = $this->cartesianProduct($optionGroups);

        return DB::transaction(function () use ($product, $combinations): Collection {
            $created = collect();

            foreach ($combinations as $valueSet) {
                $valueIds = collect($valueSet)->pluck('id')->sort()->values()->all();

                $existing = $this->findVariantByValueIds($product, $valueIds);

                if ($existing !== null) {
                    $created->push($existing);

                    continue;
                }

                $sku = $this->buildSku($product, $valueSet);
                $variant = ProductVariant::query()->create([
                    'product_id' => $product->id,
                    'sku' => $sku,
                    'additional_price' => 0,
                ]);

                $variant->optionValues()->sync($valueIds);
                $variant->inventory()->create(['quantity' => 0]);
                $created->push($variant);
            }

            return $created;
        });
    }

    /**
     * @param  list<int>  $selectedValueIds
     */
    public function resolveVariant(Product $product, array $selectedValueIds): ?ProductVariant
    {
        $product->loadMissing('options');

        if (count($selectedValueIds) !== $product->options->count()) {
            return null;
        }

        return $this->findVariantByValueIds($product, collect($selectedValueIds)->sort()->values()->all());
    }

    /**
     * @param  array<int, int>  $partialSelection  optionId => valueId
     * @return list<int>
     */
    public function availableValues(Product $product, array $partialSelection, int $optionId): array
    {
        $product->loadMissing(['options.values', 'variants.optionValues']);

        $targetOption = $product->options->firstWhere('id', $optionId);

        if ($targetOption === null) {
            return [];
        }

        $available = [];

        foreach ($targetOption->values as $value) {
            $selection = $partialSelection;
            $selection[$optionId] = $value->id;

            if ($this->hasMatchingVariant($product, $selection)) {
                $available[] = $value->id;
            }
        }

        return $available;
    }

    /**
     * @param  array<int, int>  $partialSelection
     */
    public function hasMatchingVariant(Product $product, array $partialSelection): bool
    {
        foreach ($product->variants as $variant) {
            $variantValueIds = $variant->optionValues->pluck('id')->all();
            $matches = true;

            foreach ($partialSelection as $valueId) {
                if (! in_array($valueId, $variantValueIds, true)) {
                    $matches = false;
                    break;
                }
            }

            if ($matches) {
                $inStock = $variant->inventory?->isInStock() ?? false;

                if ($inStock || count($partialSelection) < $product->options->count()) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * @param  list<int>  $valueIds
     */
    private function findVariantByValueIds(Product $product, array $valueIds): ?ProductVariant
    {
        return $product->variants()
            ->with('optionValues')
            ->get()
            ->first(function (ProductVariant $variant) use ($valueIds): bool {
                $variantIds = $variant->optionValues->pluck('id')->sort()->values()->all();

                return $variantIds === collect($valueIds)->sort()->values()->all();
            });
    }

    /**
     * @param  Collection<int, Collection<int, ProductOptionValue>>  $optionGroups
     * @return list<list<ProductOptionValue>>
     */
    private function cartesianProduct(Collection $optionGroups): array
    {
        $result = [[]];

        foreach ($optionGroups as $group) {
            $append = [];

            foreach ($result as $product) {
                foreach ($group as $item) {
                    $append[] = array_merge($product, [$item]);
                }
            }

            $result = $append;
        }

        return $result;
    }

    /**
     * @param  list<ProductOptionValue>  $valueSet
     */
    private function buildSku(Product $product, array $valueSet): string
    {
        $parts = [$product->style_code];

        foreach ($valueSet as $value) {
            $parts[] = Str::upper(Str::slug($value->slug, ''));
        }

        $base = implode('-', $parts);
        $sku = $base;
        $suffix = 1;

        while (ProductVariant::query()->where('sku', $sku)->exists()) {
            $sku = $base.'-'.$suffix;
            $suffix++;
        }

        return $sku;
    }
}
