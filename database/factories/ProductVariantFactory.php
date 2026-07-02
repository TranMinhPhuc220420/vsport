<?php

namespace Database\Factories;

use App\Models\ProductColorway;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $size = (string) fake()->numberBetween(8, 12);

        return [
            'colorway_id' => ProductColorway::factory(),
            'size_val' => 'US '.$size,
            'sku' => fake()->unique()->bothify('??####-###-US#'),
            'upc' => null,
            'additional_price' => 0,
        ];
    }
}
