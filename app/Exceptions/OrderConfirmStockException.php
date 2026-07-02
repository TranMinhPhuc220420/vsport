<?php

namespace App\Exceptions;

use Exception;

class OrderConfirmStockException extends Exception
{
    public function __construct(string $message = 'Insufficient stock to confirm order.')
    {
        parent::__construct($message);
    }
}
