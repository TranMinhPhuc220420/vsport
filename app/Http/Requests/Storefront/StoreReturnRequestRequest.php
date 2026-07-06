<?php

namespace App\Http\Requests\Storefront;

use Illuminate\Foundation\Http\FormRequest;

class StoreReturnRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.orderItemId' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * @return list<array{orderItemId: int, quantity: int}>
     */
    public function returnItems(): array
    {
        return array_map(
            fn (array $item) => [
                'orderItemId' => (int) $item['orderItemId'],
                'quantity' => (int) $item['quantity'],
            ],
            $this->validated('items'),
        );
    }
}
