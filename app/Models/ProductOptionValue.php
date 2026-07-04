<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $option_id
 * @property string $value
 * @property string $slug
 * @property string|null $swatch_hex
 * @property int $sort_order
 * @property string|null $sale_price
 * @property array<string, mixed>|null $metadata
 */
#[Fillable([
    'option_id',
    'value',
    'slug',
    'swatch_hex',
    'sort_order',
    'sale_price',
    'metadata',
])]
class ProductOptionValue extends Model
{
    public function option(): BelongsTo
    {
        return $this->belongsTo(ProductOption::class, 'option_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'option_value_id')->orderBy('sort_order');
    }

    public function variants(): BelongsToMany
    {
        return $this->belongsToMany(
            ProductVariant::class,
            'variant_option_values',
            'option_value_id',
            'variant_id',
        );
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'sale_price' => 'decimal:2',
            'metadata' => 'array',
        ];
    }
}
