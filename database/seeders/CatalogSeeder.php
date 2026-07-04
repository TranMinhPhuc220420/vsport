<?php

namespace Database\Seeders;

use App\Enums\ProductGender;
use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductColorway;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    /**
     * Seed the catalog with sample Nike-style products.
     */
    public function run(): void
    {
        $men = Category::updateOrCreate(
            ['slug' => 'men'],
            ['name' => 'Men', 'parent_id' => null],
        );

        $menShoes = Category::updateOrCreate(
            ['slug' => 'men-shoes'],
            ['name' => 'Shoes', 'parent_id' => $men->id],
        );

        $women = Category::updateOrCreate(
            ['slug' => 'women'],
            ['name' => 'Women', 'parent_id' => null],
        );

        Category::updateOrCreate(
            ['slug' => 'women-shoes'],
            ['name' => 'Shoes', 'parent_id' => $women->id],
        );

        Category::updateOrCreate(
            ['slug' => 'kids'],
            ['name' => 'Kids', 'parent_id' => null],
        );

        Category::updateOrCreate(
            ['slug' => 'jordan'],
            ['name' => 'Jordan', 'parent_id' => null],
        );

        $this->seedProduct([
            'style_code' => 'DD1391',
            'name' => 'Zegama 2',
            'slug' => 'zegama-2',
            'sub_title' => "Men's Trail Running Shoes",
            'base_price' => 180.00,
            'gender' => ProductGender::Men,
            'category_id' => $menShoes->id,
            'discount_price' => 135.00,
        ]);

        $this->seedProduct([
            'style_code' => 'FN7454',
            'name' => 'Air Max Pulse',
            'slug' => 'air-max-pulse',
            'sub_title' => "Men's Shoes",
            'base_price' => 150.00,
            'gender' => ProductGender::Men,
            'category_id' => $menShoes->id,
            'discount_price' => null,
        ]);

        $this->seedProduct([
            'style_code' => '553558',
            'name' => 'Jordan 1 Low',
            'slug' => 'jordan-1-low',
            'sub_title' => "Men's Shoes",
            'base_price' => 120.00,
            'gender' => ProductGender::Men,
            'category_id' => $menShoes->id,
            'discount_price' => null,
            'out_of_stock_sizes' => ['US 12'],
        ]);

        $this->seedProduct([
            'style_code' => 'DV4023',
            'name' => 'Revolution 7',
            'slug' => 'revolution-7',
            'sub_title' => "Women's Running Shoes",
            'base_price' => 75.00,
            'gender' => ProductGender::Women,
            'category_id' => $women->id,
            'discount_price' => 59.00,
        ]);

        $this->seedProduct([
            'style_code' => 'FB2207',
            'name' => 'Air Force 1',
            'slug' => 'air-force-1',
            'sub_title' => "Women's Shoes",
            'base_price' => 115.00,
            'gender' => ProductGender::Women,
            'category_id' => $women->id,
            'discount_price' => null,
        ]);
    }

    /**
     * @param  array{
     *     style_code: string,
     *     name: string,
     *     slug: string,
     *     sub_title: string,
     *     base_price: float,
     *     gender: ProductGender,
     *     category_id: int,
     *     discount_price?: float|null,
     *     out_of_stock_sizes?: list<string>
     * }  $data
     */
    private function seedProduct(array $data): void
    {
        $product = Product::updateOrCreate(
            ['style_code' => $data['style_code']],
            [
                'slug' => $data['slug'],
                'name' => $data['name'],
                'description' => "Sample description for {$data['name']}.",
                'category_id' => $data['category_id'],
                'sub_title' => $data['sub_title'],
                'base_price' => $data['base_price'],
                'gender' => $data['gender'],
            ],
        );

        $colorways = [
            ['code' => '100', 'name' => 'Black', 'hex' => '111111'],
            ['code' => '200', 'name' => 'White', 'hex' => 'f5f5f5'],
        ];

        $sizes = ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'];
        $outOfStock = $data['out_of_stock_sizes'] ?? [];

        foreach ($colorways as $index => $colorwayData) {
            $fullStyleCode = "{$data['style_code']}-{$colorwayData['code']}";

            $colorway = ProductColorway::updateOrCreate(
                ['full_style_code' => $fullStyleCode],
                [
                    'product_id' => $product->id,
                    'colorway_code' => $colorwayData['code'],
                    'color_name' => $colorwayData['name'],
                    'discount_price' => $index === 0 ? ($data['discount_price'] ?? null) : null,
                    'is_customizable' => false,
                    'is_active' => true,
                ],
            );

            ProductImage::updateOrCreate(
                [
                    'colorway_id' => $colorway->id,
                    'is_primary' => true,
                ],
                [
                    'image_url' => "https://placehold.co/800x800/{$colorwayData['hex']}/111111?text=".urlencode($product->name),
                    'image_alt_tag' => "{$product->name} - {$colorwayData['name']}",
                    'sort_order' => 0,
                ],
            );

            ProductImage::updateOrCreate(
                [
                    'colorway_id' => $colorway->id,
                    'sort_order' => 1,
                ],
                [
                    'image_url' => "https://placehold.co/800x800/{$colorwayData['hex']}/707072?text=Gallery",
                    'image_alt_tag' => "{$product->name} gallery",
                    'is_primary' => false,
                ],
            );

            foreach ($sizes as $size) {
                $sku = Str::slug("{$fullStyleCode}-{$size}", '-');

                $variant = ProductVariant::updateOrCreate(
                    [
                        'colorway_id' => $colorway->id,
                        'size_val' => $size,
                    ],
                    [
                        'sku' => $sku,
                        'additional_price' => 0,
                    ],
                );

                $quantity = in_array($size, $outOfStock, true) ? 0 : random_int(5, 20);

                Inventory::updateOrCreate(
                    ['variant_id' => $variant->id],
                    [
                        'quantity' => $quantity,
                        'reserved_quantity' => 0,
                    ],
                );
            }
        }
    }
}
