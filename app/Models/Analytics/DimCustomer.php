<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DimCustomer extends Model
{
    protected $table = 'dim_customers';

    /**
     * @var list<string>
     */
    protected $fillable = ['user_id', 'email'];

    public function facts(): HasMany
    {
        return $this->hasMany(FactSale::class, 'customer_dim_id');
    }
}
