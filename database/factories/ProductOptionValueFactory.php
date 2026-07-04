<?php

namespace Database\Factories;

use App\Models\ProductOption;
use App\Models\ProductOptionValue;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductOptionValue>
 */
class ProductOptionValueFactory extends Factory
{
    protected $model = ProductOptionValue::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $value = fake()->colorName();

        return [
            'option_id' => ProductOption::factory(),
            'value' => $value,
            'slug' => Str::slug($value),
            'swatch_hex' => fake()->hexColor(),
            'sort_order' => 0,
            'sale_price' => null,
            'metadata' => null,
        ];
    }
}
