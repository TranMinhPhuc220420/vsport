<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'slug'])]
class Brand extends Model
{
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function sizeGuides(): HasMany
    {
        return $this->hasMany(SizeGuide::class);
    }
}
