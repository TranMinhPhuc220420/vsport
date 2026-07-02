<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Support\MessageBag;

class InvalidDiscountCodeException extends Exception
{
    public function toMessageBag(): MessageBag
    {
        return new MessageBag(['discountCode' => $this->getMessage()]);
    }
}
