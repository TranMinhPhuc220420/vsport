<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property int|null $category_id
 * @property int|null $brand_id
 * @property bool $is_default
 * @property array<int, string> $columns
 * @property string|null $measure_content
 * @property string|null $measure_image_path
 * @property string|null $measure_image_alt
 * @property int $position
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'category_id',
    'brand_id',
    'is_default',
    'columns',
    'measure_content',
    'measure_image_path',
    'measure_image_alt',
    'position',
])]
class SizeGuide extends Model
{
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function rows(): HasMany
    {
        return $this->hasMany(SizeGuideRow::class)->orderBy('position');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
            'columns' => 'array',
            'position' => 'integer',
        ];
    }
}
