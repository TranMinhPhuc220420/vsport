<?php

namespace App\Enums;

enum ProductAttributeGroup: string
{
    case TechSpecs = 'tech_specs';
    case DetailsCare = 'details_care';
    case ShippingReturns = 'shipping_returns';
}
