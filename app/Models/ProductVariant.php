<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $product_id
 * @property string $sku
 * @property string|null $upc
 * @property string $additional_price
 * @property string|null $sale_price
 */
#[Fillable([
    'product_id',
    'sku',
    'upc',
    'additional_price',
    'sale_price',
])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    public $timestamps = false;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function optionValues(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductOptionValue::class,
            'variant_option_values',
            'variant_id',
            'option_value_id',
        );
    }

    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class, 'variant_id');
    }

    public function displayLabel(): string
    {
        $this->loadMissing('optionValues.option');

        return $this->optionValues
            ->sortBy(fn (ProductOptionValue $value) => $value->option->position)
            ->pluck('value')
            ->implode(' / ');
    }

    public function unitPrice(): float
    {
        $this->loadMissing(['product', 'optionValues']);

        $base = (float) $this->product->base_price;

        if ($this->sale_price !== null) {
            return (float) $this->sale_price;
        }

        $colorSale = $this->optionValues
            ->first(fn (ProductOptionValue $value) => $value->sale_price !== null);

        if ($colorSale !== null) {
            return (float) $colorSale->sale_price;
        }

        return $base + (float) $this->additional_price;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'additional_price' => 'decimal:2',
            'sale_price' => 'decimal:2',
        ];
    }
}
