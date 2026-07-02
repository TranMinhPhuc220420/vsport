<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DimProduct extends Model
{
    protected $table = 'dim_products';

    /**
     * @var list<string>
     */
    protected $fillable = ['product_id', 'name', 'slug'];

    public function facts(): HasMany
    {
        return $this->hasMany(FactSale::class, 'product_dim_id');
    }
}
