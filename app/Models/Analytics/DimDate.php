<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;

class DimDate extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'dim_date';

    protected $primaryKey = 'date_key';

    protected $keyType = 'string';

    /**
     * @var list<string>
     */
    protected $fillable = ['date_key', 'year', 'month', 'day', 'quarter'];
}
