<?php

namespace App\Models;

use App\Enums\ProductAttributeGroup;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $product_id
 * @property ProductAttributeGroup $group
 * @property string $key
 * @property string $label
 * @property string $value
 * @property int $sort_order
 * @property int|null $option_value_id
 */
#[Fillable([
    'product_id',
    'group',
    'key',
    'label',
    'value',
    'sort_order',
    'option_value_id',
])]
class ProductAttribute extends Model
{
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function optionValue(): BelongsTo
    {
        return $this->belongsTo(ProductOptionValue::class, 'option_value_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'group' => ProductAttributeGroup::class,
            'sort_order' => 'integer',
        ];
    }
}
