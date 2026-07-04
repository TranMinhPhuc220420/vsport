<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductCustomizationOption extends Model
{
    protected $table = 'nike_by_you_options';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'product_id',
        'component_name',
        'allowed_materials',
        'allowed_colors',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'allowed_materials' => 'array',
            'allowed_colors' => 'array',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
