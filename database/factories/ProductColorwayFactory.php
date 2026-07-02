<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductColorway;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductColorway>
 */
class ProductColorwayFactory extends Factory
{
    protected $model = ProductColorway::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $colorwayCode = fake()->numerify('###');

        return [
            'product_id' => Product::factory(),
            'colorway_code' => $colorwayCode,
            'full_style_code' => fake()->unique()->bothify('??####-###'),
            'color_name' => fake()->colorName(),
            'discount_price' => null,
            'is_customizable' => false,
            'is_active' => true,
        ];
    }
}
