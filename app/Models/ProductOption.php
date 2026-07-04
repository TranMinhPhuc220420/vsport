<?php

namespace App\Models;

use App\Enums\OptionDisplayType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $product_id
 * @property string $name
 * @property int $position
 * @property OptionDisplayType $display_type
 * @property bool $is_required
 * @property bool $drives_gallery
 * @property array<string, mixed>|null $metadata
 */
#[Fillable([
    'product_id',
    'name',
    'position',
    'display_type',
    'is_required',
    'drives_gallery',
    'metadata',
])]
class ProductOption extends Model
{
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function values(): HasMany
    {
        return $this->hasMany(ProductOptionValue::class, 'option_id')->orderBy('sort_order');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'display_type' => OptionDisplayType::class,
            'is_required' => 'boolean',
            'drives_gallery' => 'boolean',
            'metadata' => 'array',
        ];
    }
}
