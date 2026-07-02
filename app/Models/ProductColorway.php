<?php

namespace App\Models;

use Database\Factories\ProductColorwayFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $product_id
 * @property string $colorway_code
 * @property string $full_style_code
 * @property string $color_name
 * @property string|null $discount_price
 * @property bool $is_customizable
 * @property bool $is_active
 */
#[Fillable([
    'product_id',
    'colorway_code',
    'full_style_code',
    'color_name',
    'discount_price',
    'is_customizable',
    'is_active',
])]
class ProductColorway extends Model
{
    /** @use HasFactory<ProductColorwayFactory> */
    use HasFactory;

    public $timestamps = false;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class, 'colorway_id')->orderBy('sort_order');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class, 'colorway_id');
    }

    public function sustainabilityMaterials(): HasMany
    {
        return $this->hasMany(ProductSustainabilityMaterial::class, 'colorway_id');
    }

    public function nikeByYouOptions(): HasMany
    {
        return $this->hasMany(NikeByYouOption::class, 'colorway_id');
    }

    public function effectivePrice(): float
    {
        $this->loadMissing('product');

        if ($this->discount_price !== null) {
            return (float) $this->discount_price;
        }

        return (float) $this->product->base_price;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'discount_price' => 'decimal:2',
            'is_customizable' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
}
