<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NikeByYouOption extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'colorway_id',
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

    public function colorway(): BelongsTo
    {
        return $this->belongsTo(ProductColorway::class, 'colorway_id');
    }
}
