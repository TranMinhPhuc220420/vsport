<?php

namespace App\Models;

use Database\Factories\ProductImageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $option_value_id
 * @property string $image_url
 * @property string|null $storage_path
 * @property string|null $image_alt_tag
 * @property bool $is_primary
 * @property int $sort_order
 */
#[Fillable([
    'option_value_id',
    'image_url',
    'storage_path',
    'image_alt_tag',
    'is_primary',
    'sort_order',
])]
class ProductImage extends Model
{
    /** @use HasFactory<ProductImageFactory> */
    use HasFactory;

    public $timestamps = false;

    public function optionValue(): BelongsTo
    {
        return $this->belongsTo(ProductOptionValue::class, 'option_value_id');
    }

    /**
     * @param  Builder<ProductImage>  $query
     * @return Builder<ProductImage>
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }

    /**
     * @param  Builder<ProductImage>  $query
     * @return Builder<ProductImage>
     */
    public function scopePrimary(Builder $query): Builder
    {
        return $query->where('is_primary', true);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
