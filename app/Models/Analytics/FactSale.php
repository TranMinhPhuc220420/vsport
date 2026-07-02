<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactSale extends Model
{
    protected $table = 'fact_sales';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'order_id',
        'order_item_id',
        'date_key',
        'customer_dim_id',
        'product_dim_id',
        'quantity',
        'line_revenue',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date_key' => 'date',
            'quantity' => 'integer',
            'line_revenue' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(DimCustomer::class, 'customer_dim_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(DimProduct::class, 'product_dim_id');
    }
}
