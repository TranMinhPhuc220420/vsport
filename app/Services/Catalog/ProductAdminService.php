<?php

namespace App\Services\Catalog;

use App\Enums\ProductGender;
use App\Models\Category;
use App\Models\CategoryOptionTemplate;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductCustomizationOption;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductAdminService
{
    public function __construct(
        private readonly ProductOptionService $options,
    ) {}

    /**
     * @param  array{
     *     style_code: string,
     *     name: string,
     *     slug: string,
     *     description?: string|null,
     *     category_id: int,
     *     sub_title?: string|null,
     *     base_price: float|string,
     *     gender: string,
     *     is_customizable?: bool,
     * }  $productData
     * @param  list<array<string, mixed>>|null  $optionsPayload
     */
    public function createProduct(array $productData, ?array $optionsPayload = null): Product
    {
        return DB::transaction(function () use ($productData, $optionsPayload): Product {
            $product = Product::query()->create([
                ...collect($productData)->except('is_customizable')->all(),
                'gender' => ProductGender::from($productData['gender']),
                'is_customizable' => $productData['is_customizable'] ?? false,
            ]);

            if ($optionsPayload !== null && $optionsPayload !== []) {
                $this->options->syncOptions($product, $optionsPayload);
                $this->options->generateVariants($product);
            } else {
                $this->applyCategoryTemplates($product);
                $this->options->generateVariants($product);
            }

            return $this->loadAdminProduct($product);
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
     *     gender: string,
     *     is_customizable?: bool,
     * }  $productData
     */
    public function updateProduct(Product $product, array $productData): Product
    {
        $product->update([
            ...collect($productData)->except('is_customizable')->all(),
            'gender' => ProductGender::from($productData['gender']),
            'is_customizable' => $productData['is_customizable'] ?? $product->is_customizable,
        ]);

        return $this->loadAdminProduct($product->fresh());
    }

    /**
     * @param  list<array{id: int, quantity: int}>  $variants
     */
    public function batchUpdateInventory(Product $product, array $variants): Product
    {
        return DB::transaction(function () use ($product, $variants): Product {
            $allowedIds = $product->variants()->pluck('id')->all();

            foreach ($variants as $row) {
                if (! in_array($row['id'], $allowedIds, true)) {
                    continue;
                }

                Inventory::query()->updateOrCreate(
                    ['variant_id' => $row['id']],
                    ['quantity' => $row['quantity'], 'reserved_quantity' => 0],
                );
            }

            return $this->loadAdminProduct($product->fresh());
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
     * @param  list<array{
     *     group: string,
     *     key: string,
     *     label: string,
     *     value: string,
     *     sortOrder?: int,
     *     optionValueId?: int|null,
     * }>  $attributes
     */
    public function syncAttributes(Product $product, array $attributes): Product
    {
        return DB::transaction(function () use ($product, $attributes): Product {
            $product->attributes()->delete();

            foreach ($attributes as $index => $row) {
                ProductAttribute::query()->create([
                    'product_id' => $product->id,
                    'group' => $row['group'],
                    'key' => $row['key'],
                    'label' => $row['label'],
                    'value' => $row['value'],
                    'sort_order' => $row['sortOrder'] ?? $index,
                    'option_value_id' => $row['optionValueId'] ?? null,
                ]);
            }

            return $this->loadAdminProduct($product->fresh());
        });
    }

    /**
     * @param  list<array{
     *     componentName: string,
     *     allowedMaterials: list<string>,
     *     allowedColors: list<array{hex: string, name: string}>,
     * }>  $options
     */
    public function syncCustomizationOptions(Product $product, array $options): Product
    {
        return DB::transaction(function () use ($product, $options): Product {
            $product->customizationOptions()->delete();

            foreach ($options as $row) {
                ProductCustomizationOption::query()->create([
                    'product_id' => $product->id,
                    'component_name' => $row['componentName'],
                    'allowed_materials' => $row['allowedMaterials'],
                    'allowed_colors' => $row['allowedColors'],
                ]);
            }

            $product->update(['is_customizable' => $options !== []]);

            return $this->loadAdminProduct($product->fresh());
        });
    }

    public function applyCategoryTemplates(Product $product): void
    {
        $category = Category::query()
            ->with('optionTemplates')
            ->find($product->category_id);

        if ($category === null || $category->optionTemplates->isEmpty()) {
            return;
        }

        $payload = $category->optionTemplates->map(fn (CategoryOptionTemplate $template) => [
            'name' => $template->name,
            'position' => $template->position,
            'displayType' => $template->display_type->value,
            'isRequired' => $template->is_required,
            'drivesGallery' => $template->drives_gallery,
            'metadata' => $template->metadata,
            'values' => collect($template->default_values ?? [])->map(
                fn (string $value, int $index) => [
                    'value' => $value,
                    'slug' => Str::slug($value),
                    'sortOrder' => $index,
                ],
            )->values()->all(),
        ])->all();

        $this->options->syncOptions($product, $payload);
    }

    public function loadAdminProduct(Product $product): Product
    {
        return $product->load([
            'category',
            'options.values.images',
            'variants.optionValues.option',
            'variants.inventory',
            'attributes',
            'customizationOptions',
            'sustainabilityMaterials',
        ]);
    }
}
