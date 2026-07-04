<?php

namespace Database\Factories;

use App\Models\ProductImage;
use App\Models\ProductOptionValue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductImage>
 */
class ProductImageFactory extends Factory
{
    protected $model = ProductImage::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'option_value_id' => ProductOptionValue::factory(),
            'image_url' => 'https://placehold.co/800x800/f5f5f5/111111?text=Product',
            'image_alt_tag' => fake()->sentence(3),
            'is_primary' => true,
            'sort_order' => 0,
        ];
    }
}
