<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSustainabilityMaterial extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'product_id',
        'component_name',
        'material_type',
        'component_weight_g',
        'recycled_content_pct',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'component_weight_g' => 'integer',
            'recycled_content_pct' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
