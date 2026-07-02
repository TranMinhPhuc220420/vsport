<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $colorway_id
 * @property string $size_val
 * @property string $sku
 * @property string|null $upc
 * @property string $additional_price
 */
#[Fillable([
    'colorway_id',
    'size_val',
    'sku',
    'upc',
    'additional_price',
])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    public $timestamps = false;

    public function colorway(): BelongsTo
    {
        return $this->belongsTo(ProductColorway::class, 'colorway_id');
    }

    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class, 'variant_id');
    }

    public function unitPrice(): float
    {
        $this->loadMissing('colorway.product');

        return $this->colorway->effectivePrice() + (float) $this->additional_price;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'additional_price' => 'decimal:2',
        ];
    }
}
