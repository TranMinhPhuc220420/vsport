<?php

namespace Database\Factories;

use App\Enums\ProductGender;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->words(3, true);
        $styleCode = strtoupper(fake()->unique()->bothify('??####'));

        return [
            'style_code' => $styleCode,
            'name' => ucwords($name),
            'slug' => Str::slug($name),
            'description' => fake()->paragraph(),
            'category_id' => Category::factory(),
            'sub_title' => fake()->optional()->sentence(),
            'base_price' => fake()->randomFloat(2, 80, 250),
            'gender' => fake()->randomElement(ProductGender::cases()),
            'warranty_info' => null,
            'care_instructions' => null,
            'return_policy' => null,
            'average_rating' => 0,
            'review_count' => 0,
        ];
    }
}
