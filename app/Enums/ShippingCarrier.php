<?php

namespace App\Enums;

enum ShippingCarrier: string
{
    case Ghtk = 'ghtk';
    case Ghn = 'ghn';
    case ViettelPost = 'viettel_post';
    case Vnpost = 'vnpost';
    case JtExpress = 'jt_express';
    case Other = 'other';
}
