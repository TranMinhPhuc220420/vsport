<?php

namespace App\Exceptions;

use Exception;

class InvalidReturnTransitionException extends Exception
{
    public function __construct(string $from, string $to)
    {
        parent::__construct("Cannot transition return request from {$from} to {$to}.");
    }
}
