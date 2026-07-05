<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $size_guide_id
 * @property array<int, string> $values
 * @property int $position
 */
#[Fillable(['size_guide_id', 'values', 'position'])]
class SizeGuideRow extends Model
{
    public function sizeGuide(): BelongsTo
    {
        return $this->belongsTo(SizeGuide::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'values' => 'array',
            'position' => 'integer',
        ];
    }
}
