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
            'image_url' => 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&auto=format',
            'image_alt_tag' => fake()->sentence(3),
            'is_primary' => true,
            'sort_order' => 0,
        ];
    }
}
