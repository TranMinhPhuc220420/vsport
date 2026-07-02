<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'order_number' => fake()->unique()->bothify('VS-########'),
            'status' => OrderStatus::Pending,
            'total_amount' => fake()->randomFloat(2, 50, 500),
            'shipping_address' => fake()->address(),
            'payment_intent_id' => null,
        ];
    }
}
