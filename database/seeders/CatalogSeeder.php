<?php

namespace Database\Seeders;

use App\Enums\OptionDisplayType;
use App\Enums\ProductAttributeGroup;
use App\Enums\ProductGender;
use App\Models\Brand;
use App\Models\Category;
use App\Models\CategoryOptionTemplate;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductImage;
use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    /** @var array<string, mixed> */
    private array $seedImages;

    public function __construct()
    {
        /** @var array<string, mixed> $images */
        $images = require __DIR__.'/data/seed_images.php';
        $this->seedImages = $images;
    }

    public function run(): void
    {
        $categories = $this->seedCategories();

        $menShoes = $categories['men-shoes'];
        $womenShoes = $categories['women-shoes'];
        $bags = $categories['bags'];
        $paddles = $categories['paddles'];
        $apparel = $categories['apparel'];

        $nike = Brand::query()->where('slug', 'nike')->first();
        $hoka = Brand::query()->where('slug', 'hoka')->first();

        $this->seedShoeTemplate($menShoes);
        $this->seedShoeTemplate($womenShoes);
        $this->seedBagTemplate($bags);
        $this->seedPaddleTemplate($paddles);
        $this->seedApparelTemplate($apparel);

        $this->seedShoeProduct([
            'style_code' => 'DD1391',
            'name' => 'Zegama 2',
            'slug' => 'zegama-2',
            'sub_title' => "Men's Trail Running Shoes",
            'base_price' => 180.00,
            'gender' => ProductGender::Men,
            'category_id' => $menShoes->id,
            'brand_id' => $hoka?->id,
            'sale_price' => 135.00,
        ]);

        $this->seedShoeProduct([
            'style_code' => 'FN7454',
            'name' => 'Air Max Pulse',
            'slug' => 'air-max-pulse',
            'sub_title' => "Men's Shoes",
            'base_price' => 150.00,
            'gender' => ProductGender::Men,
            'category_id' => $menShoes->id,
            'brand_id' => $nike?->id,
        ]);

        $this->seedShoeProduct([
            'style_code' => '553558',
            'name' => 'Jordan 1 Low',
            'slug' => 'jordan-1-low',
            'sub_title' => "Men's Shoes",
            'base_price' => 120.00,
            'gender' => ProductGender::Men,
            'category_id' => $menShoes->id,
            'brand_id' => $nike?->id,
            'out_of_stock_sizes' => ['US 12'],
        ]);

        $this->seedShoeProduct([
            'style_code' => 'DV4023',
            'name' => 'Revolution 7',
            'slug' => 'revolution-7',
            'sub_title' => "Women's Running Shoes",
            'base_price' => 75.00,
            'gender' => ProductGender::Women,
            'category_id' => $womenShoes->id,
            'brand_id' => $nike?->id,
            'sale_price' => 59.00,
        ]);

        $this->seedBagProduct();
        $this->seedPaddleProduct();
    }

    private function seedShoeTemplate(Category $category): void
    {
        CategoryOptionTemplate::updateOrCreate(
            ['category_id' => $category->id, 'name' => 'Color'],
            [
                'position' => 0,
                'display_type' => OptionDisplayType::Swatch,
                'is_required' => true,
                'drives_gallery' => true,
                'default_values' => ['Black', 'White'],
            ],
        );

        CategoryOptionTemplate::updateOrCreate(
            ['category_id' => $category->id, 'name' => 'Size'],
            [
                'position' => 1,
                'display_type' => OptionDisplayType::Button,
                'is_required' => true,
                'drives_gallery' => false,
                'default_values' => ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
            ],
        );
    }

    private function seedBagTemplate(Category $category): void
    {
        CategoryOptionTemplate::updateOrCreate(
            ['category_id' => $category->id, 'name' => 'Color'],
            [
                'position' => 0,
                'display_type' => OptionDisplayType::Swatch,
                'is_required' => true,
                'drives_gallery' => true,
                'default_values' => ['Black', 'Navy'],
            ],
        );
    }

    private function seedPaddleTemplate(Category $category): void
    {
        CategoryOptionTemplate::updateOrCreate(
            ['category_id' => $category->id, 'name' => 'Shape'],
            [
                'position' => 0,
                'display_type' => OptionDisplayType::Button,
                'is_required' => true,
                'drives_gallery' => false,
                'default_values' => ['Widebody', 'Elongated'],
            ],
        );

        CategoryOptionTemplate::updateOrCreate(
            ['category_id' => $category->id, 'name' => 'Core'],
            [
                'position' => 1,
                'display_type' => OptionDisplayType::Swatch,
                'is_required' => true,
                'drives_gallery' => true,
                'default_values' => ['Chalk', 'Cosmic', 'Hydro'],
                'metadata' => ['edition' => 'core'],
            ],
        );

        CategoryOptionTemplate::updateOrCreate(
            ['category_id' => $category->id, 'name' => 'Limited'],
            [
                'position' => 2,
                'display_type' => OptionDisplayType::Swatch,
                'is_required' => false,
                'drives_gallery' => true,
                'default_values' => ['Canyon Clay'],
                'metadata' => ['edition' => 'limited'],
            ],
        );
    }

    private function seedApparelTemplate(Category $category): void
    {
        CategoryOptionTemplate::updateOrCreate(
            ['category_id' => $category->id, 'name' => 'Color'],
            [
                'position' => 0,
                'display_type' => OptionDisplayType::Swatch,
                'is_required' => true,
                'drives_gallery' => true,
                'default_values' => ['Black', 'White'],
            ],
        );

        CategoryOptionTemplate::updateOrCreate(
            ['category_id' => $category->id, 'name' => 'Size'],
            [
                'position' => 1,
                'display_type' => OptionDisplayType::Button,
                'is_required' => true,
                'drives_gallery' => false,
                'default_values' => ['S', 'M', 'L', 'XL'],
            ],
        );
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
     *     brand_id?: int|null,
     *     sale_price?: float|null,
     *     out_of_stock_sizes?: list<string>
     * }  $data
     */
    private function seedShoeProduct(array $data): void
    {
        $product = Product::updateOrCreate(
            ['style_code' => $data['style_code']],
            [
                'slug' => $data['slug'],
                'name' => $data['name'],
                'description' => "Sample description for {$data['name']}.",
                'category_id' => $data['category_id'],
                'brand_id' => $data['brand_id'] ?? null,
                'sub_title' => $data['sub_title'],
                'base_price' => $data['base_price'],
                'gender' => $data['gender'],
            ],
        );

        $colors = [
            ['name' => 'Black', 'hex' => '111111', 'sale' => $data['sale_price'] ?? null],
            ['name' => 'White', 'hex' => 'f5f5f5', 'sale' => null],
        ];
        $sizes = ['US 8', 'US 9', 'US 10', 'US 11', 'US 12'];
        $outOfStock = $data['out_of_stock_sizes'] ?? [];

        $colorOption = ProductOption::updateOrCreate(
            ['product_id' => $product->id, 'name' => 'Color'],
            [
                'position' => 0,
                'display_type' => OptionDisplayType::Swatch,
                'is_required' => true,
                'drives_gallery' => true,
            ],
        );

        $sizeOption = ProductOption::updateOrCreate(
            ['product_id' => $product->id, 'name' => 'Size'],
            [
                'position' => 1,
                'display_type' => OptionDisplayType::Button,
                'is_required' => true,
                'drives_gallery' => false,
            ],
        );

        $colorValues = [];
        foreach ($colors as $index => $color) {
            $value = ProductOptionValue::updateOrCreate(
                ['option_id' => $colorOption->id, 'slug' => Str::slug($color['name'])],
                [
                    'value' => $color['name'],
                    'swatch_hex' => "#{$color['hex']}",
                    'sort_order' => $index,
                    'sale_price' => $color['sale'],
                ],
            );
            $colorValues[] = $value;

            ProductImage::updateOrCreate(
                ['option_value_id' => $value->id, 'is_primary' => true],
                [
                    'image_url' => $this->productImageUrl(
                        $data['style_code'],
                        $color['name'],
                        $color['hex'],
                        $product->name,
                    ),
                    'image_alt_tag' => "{$product->name} - {$color['name']}",
                    'sort_order' => 0,
                ],
            );
        }

        $sizeValues = [];
        foreach ($sizes as $index => $size) {
            $sizeValues[] = ProductOptionValue::updateOrCreate(
                ['option_id' => $sizeOption->id, 'slug' => Str::slug($size)],
                ['value' => $size, 'sort_order' => $index],
            );
        }

        foreach ($colorValues as $colorValue) {
            foreach ($sizeValues as $sizeValue) {
                $sku = Str::upper(Str::slug("{$data['style_code']}-{$colorValue->slug}-{$sizeValue->slug}", '-'));
                $variant = ProductVariant::updateOrCreate(
                    ['sku' => $sku],
                    ['product_id' => $product->id, 'additional_price' => 0],
                );
                $variant->optionValues()->sync([$colorValue->id, $sizeValue->id]);

                $quantity = in_array($sizeValue->value, $outOfStock, true) ? 0 : random_int(5, 20);
                Inventory::updateOrCreate(
                    ['variant_id' => $variant->id],
                    ['quantity' => $quantity, 'reserved_quantity' => 0],
                );
            }
        }
    }

    private function seedBagProduct(): void
    {
        $bags = Category::where('slug', 'bags')->firstOrFail();

        $product = Product::updateOrCreate(
            ['style_code' => 'CORE-BAG'],
            [
                'slug' => 'core-team-bag',
                'name' => 'Core Team Bag',
                'description' => 'Spacious team bag with dedicated paddle pocket.',
                'category_id' => $bags->id,
                'sub_title' => 'Pickleball Bag',
                'base_price' => 89.00,
                'gender' => ProductGender::Unisex,
            ],
        );

        $colorOption = ProductOption::updateOrCreate(
            ['product_id' => $product->id, 'name' => 'Color'],
            [
                'position' => 0,
                'display_type' => OptionDisplayType::Swatch,
                'is_required' => true,
                'drives_gallery' => true,
            ],
        );

        foreach ([['Black', '111111'], ['Navy', '1a2a4a']] as $index => [$name, $hex]) {
            $value = ProductOptionValue::updateOrCreate(
                ['option_id' => $colorOption->id, 'slug' => Str::slug($name)],
                ['value' => $name, 'swatch_hex' => "#{$hex}", 'sort_order' => $index],
            );

            ProductImage::updateOrCreate(
                ['option_value_id' => $value->id, 'is_primary' => true],
                [
                    'image_url' => $this->bagImageUrl('CORE-BAG', $name, $hex),
                    'image_alt_tag' => $name,
                    'sort_order' => 0,
                ],
            );

            $variant = ProductVariant::updateOrCreate(
                ['sku' => 'CORE-BAG-'.Str::upper(Str::slug($name, ''))],
                ['product_id' => $product->id, 'additional_price' => 0],
            );
            $variant->optionValues()->sync([$value->id]);
            Inventory::updateOrCreate(
                ['variant_id' => $variant->id],
                ['quantity' => 15, 'reserved_quantity' => 0],
            );
        }
    }

    private function seedPaddleProduct(): void
    {
        $paddles = Category::where('slug', 'paddles')->firstOrFail();

        $product = Product::updateOrCreate(
            ['style_code' => 'OMNI'],
            [
                'slug' => 'selkirk-omni-paddle',
                'name' => 'Selkirk OMNI Pickleball Paddle',
                'description' => 'All-court paddle with ReactCore technology.',
                'category_id' => $paddles->id,
                'sub_title' => 'All-Court Paddle',
                'base_price' => 300.00,
                'gender' => ProductGender::Unisex,
            ],
        );

        $shapeOption = ProductOption::updateOrCreate(
            ['product_id' => $product->id, 'name' => 'Shape'],
            ['position' => 0, 'display_type' => OptionDisplayType::Button, 'is_required' => true, 'drives_gallery' => false],
        );
        $coreOption = ProductOption::updateOrCreate(
            ['product_id' => $product->id, 'name' => 'Core'],
            ['position' => 1, 'display_type' => OptionDisplayType::Swatch, 'is_required' => false, 'drives_gallery' => true, 'metadata' => ['edition' => 'core']],
        );
        $limitedOption = ProductOption::updateOrCreate(
            ['product_id' => $product->id, 'name' => 'Limited'],
            ['position' => 2, 'display_type' => OptionDisplayType::Swatch, 'is_required' => false, 'drives_gallery' => true, 'metadata' => ['edition' => 'limited']],
        );

        $shapes = [];
        foreach (['Widebody', 'Elongated'] as $i => $shape) {
            $shapes[] = ProductOptionValue::updateOrCreate(
                ['option_id' => $shapeOption->id, 'slug' => Str::slug($shape)],
                ['value' => $shape, 'sort_order' => $i],
            );
        }

        $coreColors = [];
        foreach ([['Chalk', 'f5f5dc'], ['Cosmic', '2b1b4a'], ['Hydro', '1e4d6b']] as $i => [$name, $hex]) {
            $value = ProductOptionValue::updateOrCreate(
                ['option_id' => $coreOption->id, 'slug' => Str::slug($name)],
                ['value' => $name, 'swatch_hex' => "#{$hex}", 'sort_order' => $i, 'metadata' => ['edition' => 'core']],
            );
            $coreColors[] = $value;
            ProductImage::updateOrCreate(
                ['option_value_id' => $value->id, 'is_primary' => true],
                [
                    'image_url' => $this->paddleImageUrl('OMNI', $name, $hex),
                    'image_alt_tag' => $name,
                    'sort_order' => 0,
                ],
            );
        }

        $limitedValue = ProductOptionValue::updateOrCreate(
            ['option_id' => $limitedOption->id, 'slug' => 'canyon-clay'],
            ['value' => 'Canyon Clay', 'swatch_hex' => '#c45c3e', 'sort_order' => 0, 'metadata' => ['edition' => 'limited']],
        );
        ProductImage::updateOrCreate(
            ['option_value_id' => $limitedValue->id, 'is_primary' => true],
            [
                'image_url' => $this->paddleImageUrl('OMNI', 'Canyon Clay', 'c45c3e'),
                'image_alt_tag' => 'Canyon Clay',
                'sort_order' => 0,
            ],
        );

        foreach ($shapes as $shape) {
            foreach ($coreColors as $core) {
                $sku = Str::upper("OMNI-{$shape->slug}-{$core->slug}");
                $variant = ProductVariant::updateOrCreate(
                    ['sku' => $sku],
                    ['product_id' => $product->id, 'additional_price' => 0],
                );
                $variant->optionValues()->sync([$shape->id, $core->id]);
                Inventory::updateOrCreate(['variant_id' => $variant->id], ['quantity' => 10, 'reserved_quantity' => 0]);
            }

            $sku = Str::upper("OMNI-{$shape->slug}-{$limitedValue->slug}");
            $variant = ProductVariant::updateOrCreate(
                ['sku' => $sku],
                ['product_id' => $product->id, 'additional_price' => 0],
            );
            $variant->optionValues()->sync([$shape->id, $limitedValue->id]);
            Inventory::updateOrCreate(['variant_id' => $variant->id], ['quantity' => 0, 'reserved_quantity' => 0]);
        }

        ProductAttribute::updateOrCreate(
            ['product_id' => $product->id, 'group' => ProductAttributeGroup::TechSpecs, 'key' => 'core_material'],
            ['label' => 'Core material', 'value' => 'PureFoam', 'sort_order' => 0],
        );
        ProductAttribute::updateOrCreate(
            ['product_id' => $product->id, 'group' => ProductAttributeGroup::TechSpecs, 'key' => 'thickness'],
            ['label' => 'Core thickness', 'value' => '16mm', 'sort_order' => 1],
        );
    }

    private function productImageUrl(
        string $styleCode,
        string $colorName,
        string $hexFallback,
        string $productName,
    ): string {
        /** @var array<string, array<string, string>> $products */
        $products = $this->seedImages['products'];

        return $products[$styleCode][$colorName]
            ?? "https://placehold.co/800x800/{$hexFallback}/111111?text=".urlencode($productName);
    }

    private function bagImageUrl(string $styleCode, string $colorName, string $hexFallback): string
    {
        /** @var array<string, array<string, string>> $bags */
        $bags = $this->seedImages['bags'];

        return $bags[$styleCode][$colorName]
            ?? "https://placehold.co/800x800/{$hexFallback}/ffffff?text=Bag";
    }

    private function paddleImageUrl(string $styleCode, string $colorName, string $hexFallback): string
    {
        /** @var array<string, array<string, string>> $paddles */
        $paddles = $this->seedImages['paddles'];

        return $paddles[$styleCode][$colorName]
            ?? "https://placehold.co/800x800/{$hexFallback}/ffffff?text=OMNI";
    }

    /**
     * @return array<string, Category>
     */
    private function seedCategories(): array
    {
        /** @var list<array{slug: string, name: string, image_url?: string, image_alt?: string, children?: list<array{slug: string, name: string, image_url?: string, image_alt?: string}>}> $tree */
        $tree = require __DIR__.'/data/categories.php';

        $bySlug = [];

        foreach ($tree as $root) {
            $category = $this->upsertCategory($root, null);
            $bySlug[$root['slug']] = $category;

            foreach ($root['children'] ?? [] as $child) {
                $childCategory = $this->upsertCategory($child, $category->id);
                $bySlug[$child['slug']] = $childCategory;
            }
        }

        return $bySlug;
    }

    /**
     * @param  array{slug: string, name: string, image_url?: string, image_alt?: string}  $data
     */
    private function upsertCategory(array $data, ?int $parentId): Category
    {
        return Category::updateOrCreate(
            ['slug' => $data['slug']],
            [
                'name' => $data['name'],
                'parent_id' => $parentId,
                'image_path' => $data['image_url'] ?? null,
                'image_alt' => $data['image_alt'] ?? $data['name'],
            ],
        );
    }
}
