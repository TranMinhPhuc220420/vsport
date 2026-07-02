<?php

namespace App\Models;

use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $order_id
 * @property int $variant_id
 * @property string $product_name
 * @property string $color_name
 * @property string $size_val
 * @property array<string, mixed>|null $custom_configuration
 * @property int $quantity
 * @property string $unit_price
 */
#[Fillable([
    'order_id',
    'variant_id',
    'product_name',
    'color_name',
    'size_val',
    'custom_configuration',
    'quantity',
    'unit_price',
])]
class OrderItem extends Model
{
    /** @use HasFactory<OrderItemFactory> */
    use HasFactory;

    public $timestamps = false;

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'custom_configuration' => 'array',
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
        ];
    }
}
