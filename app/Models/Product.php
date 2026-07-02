<?php

namespace App\Models;

use App\Enums\ProductGender;
use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $style_code
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property int $category_id
 * @property string|null $sub_title
 * @property string $base_price
 * @property ProductGender $gender
 * @property string|null $warranty_info
 * @property string|null $care_instructions
 * @property string|null $return_policy
 * @property string $average_rating
 * @property int $review_count
 * @property bool $is_featured
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'style_code',
    'name',
    'slug',
    'description',
    'category_id',
    'sub_title',
    'base_price',
    'gender',
    'warranty_info',
    'care_instructions',
    'return_policy',
    'average_rating',
    'review_count',
    'is_featured',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function colorways(): HasMany
    {
        return $this->hasMany(ProductColorway::class);
    }

    public function activeColorways(): HasMany
    {
        return $this->colorways()->where('is_active', true);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function approvedReviews(): HasMany
    {
        return $this->reviews()->where('is_approved', true)->latest();
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'gender' => ProductGender::class,
            'average_rating' => 'decimal:2',
            'review_count' => 'integer',
            'is_featured' => 'boolean',
        ];
    }
}
