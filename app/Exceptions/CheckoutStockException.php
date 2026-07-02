<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Support\MessageBag;

class CheckoutStockException extends Exception
{
    /**
     * @param  array<int, string>  $errors
     */
    public function __construct(
        private readonly array $errors,
    ) {
        parent::__construct('One or more items are out of stock.');
    }

    public function toMessageBag(): MessageBag
    {
        $bag = new MessageBag;

        foreach ($this->errors as $index => $message) {
            $bag->add("items.{$index}.variantId", $message);
        }

        return $bag;
    }
}
