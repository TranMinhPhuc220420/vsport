<?php

namespace App\Enums;

enum RefundStatus: string
{
    case Refunded = 'refunded';
    case Failed = 'failed';
}
