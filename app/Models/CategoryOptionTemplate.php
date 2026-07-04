<?php

namespace App\Models;

use App\Enums\OptionDisplayType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $category_id
 * @property string $name
 * @property int $position
 * @property OptionDisplayType $display_type
 * @property bool $is_required
 * @property bool $drives_gallery
 * @property array<int, string>|null $default_values
 * @property array<string, mixed>|null $metadata
 */
#[Fillable([
    'category_id',
    'name',
    'position',
    'display_type',
    'is_required',
    'drives_gallery',
    'default_values',
    'metadata',
])]
class CategoryOptionTemplate extends Model
{
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
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
            'default_values' => 'array',
            'metadata' => 'array',
        ];
    }
}
