<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Low Stock Threshold
    |--------------------------------------------------------------------------
    |
    | A variant is considered "low stock" when its available quantity
    | (quantity - reserved_quantity) is at or below this number. Used by the
    | admin dashboard widget and the `inventory:check-low-stock` alert email.
    |
    */

    'low_stock_threshold' => (int) env('LOW_STOCK_THRESHOLD', 5),

];
