<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $content_section_id
 * @property string $image_url
 * @property string|null $storage_path
 * @property string|null $image_alt_tag
 * @property int $sort_order
 */
#[Fillable([
    'content_section_id',
    'image_url',
    'storage_path',
    'image_alt_tag',
    'sort_order',
])]
class ProductContentSectionImage extends Model
{
    public $timestamps = false;

    public function contentSection(): BelongsTo
    {
        return $this->belongsTo(ProductContentSection::class, 'content_section_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }
}
