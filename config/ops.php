<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Ops Token
    |--------------------------------------------------------------------------
    |
    | Secret token for one-off deployment endpoints (storage:link, clear-cache)
    | when shell access is unavailable. Pass via ?token= or X-Ops-Token header.
    |
    */

    'token' => env('OPS_TOKEN'),

];
