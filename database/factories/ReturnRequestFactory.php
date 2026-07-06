<?php

namespace Database\Factories;

use App\Enums\ReturnRequestStatus;
use App\Models\Order;
use App\Models\ReturnRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReturnRequest>
 */
class ReturnRequestFactory extends Factory
{
    protected $model = ReturnRequest::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'user_id' => User::factory(),
            'status' => ReturnRequestStatus::Pending,
            'reason' => fake()->sentence(),
            'admin_notes' => null,
            'requested_at' => now(),
            'resolved_at' => null,
        ];
    }
}
