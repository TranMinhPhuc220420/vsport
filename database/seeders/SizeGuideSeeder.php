<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\SizeGuide;
use Illuminate\Database\Seeder;

class SizeGuideSeeder extends Seeder
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
        $this->seedDefaultShoeGuide();
        $this->seedBrandShoeGuides();
        $this->seedApparelGuide();
    }

    private function seedDefaultShoeGuide(): void
    {
        $columns = ['CM', 'EU', 'UK', 'US'];
        $rows = [
            ['24', '38', '5', '5.5'],
            ['24.5', '39', '5.5', '6'],
            ['25', '40', '6', '7'],
            ['25.5', '40.5', '6.5', '7.5'],
            ['26', '41', '7', '8'],
            ['26.5', '42', '7.5', '8.5'],
            ['27', '42.5', '8', '9'],
            ['27.5', '43', '8.5', '9.5'],
            ['28', '44', '9', '10'],
            ['28.5', '44.5', '9.5', '10.5'],
            ['29', '45', '10', '11'],
            ['29.5', '45.5', '10.5', '11.5'],
            ['30', '46', '11', '12'],
        ];

        $guide = SizeGuide::query()->updateOrCreate(
            ['name' => 'Giày'],
            [
                'category_id' => null,
                'brand_id' => null,
                'is_default' => true,
                'columns' => $columns,
                ...$this->shoeMeasureAttributes(),
            ],
        );

        $this->syncRows($guide, $rows);
    }

    private function seedBrandShoeGuides(): void
    {
        /** @var list<array{slug: string, name: string, brand_slug: string|null, columns: list<string>, rows: list<list<string>>}> $guides */
        $guides = require __DIR__.'/data/shoe_brand_size_guides.php';

        foreach ($guides as $position => $definition) {
            $brandId = null;

            if ($definition['brand_slug'] !== null) {
                $brand = Brand::query()->where('slug', $definition['brand_slug'])->first();

                if ($brand === null) {
                    continue;
                }

                $brandId = $brand->id;
            }

            $matchAttributes = $brandId !== null
                ? ['brand_id' => $brandId]
                : ['name' => $definition['name'], 'brand_id' => null];

            $guide = SizeGuide::query()->updateOrCreate(
                $matchAttributes,
                [
                    'name' => $definition['name'],
                    'category_id' => null,
                    'is_default' => false,
                    'columns' => $definition['columns'],
                    'position' => $position + 1,
                ],
            );

            $this->syncRows($guide, $definition['rows']);
        }
    }

    private function seedApparelGuide(): void
    {
        $apparelCategory = Category::query()->where('slug', 'apparel')->first();

        if ($apparelCategory === null) {
            return;
        }

        $columns = ['Size', 'Ngực (cm)', 'Eo (cm)'];
        $rows = [
            ['S', '86-91', '71-76'],
            ['M', '94-99', '79-84'],
            ['L', '102-107', '86-91'],
            ['XL', '109-114', '94-99'],
        ];

        $guide = SizeGuide::query()->updateOrCreate(
            ['category_id' => $apparelCategory->id],
            [
                'name' => 'Quần áo',
                'brand_id' => null,
                'is_default' => false,
                'columns' => $columns,
                ...$this->apparelMeasureAttributes(),
            ],
        );

        $this->syncRows($guide, $rows);
    }

    /**
     * @return array{measure_content: string, measure_image_path: string, measure_image_alt: string}
     */
    private function shoeMeasureAttributes(): array
    {
        /** @var array{url: string, alt: string, content: string} $measure */
        $measure = $this->seedImages['size_guides']['shoe_measure'];

        return [
            'measure_content' => $measure['content'],
            'measure_image_path' => $measure['url'],
            'measure_image_alt' => $measure['alt'],
        ];
    }

    /**
     * @return array{measure_content: string, measure_image_path: string, measure_image_alt: string}
     */
    private function apparelMeasureAttributes(): array
    {
        /** @var array{url: string, alt: string, content: string} $measure */
        $measure = $this->seedImages['size_guides']['apparel_measure'];

        return [
            'measure_content' => $measure['content'],
            'measure_image_path' => $measure['url'],
            'measure_image_alt' => $measure['alt'],
        ];
    }

    /**
     * @param  list<list<string>>  $rows
     */
    private function syncRows(SizeGuide $sizeGuide, array $rows): void
    {
        $sizeGuide->rows()->delete();

        foreach ($rows as $position => $values) {
            $sizeGuide->rows()->create([
                'values' => $values,
                'position' => $position,
            ]);
        }
    }
}
