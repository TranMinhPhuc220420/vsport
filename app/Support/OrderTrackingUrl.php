<?php

namespace App\Support;

use App\Enums\ShippingCarrier;
use App\Models\Order;

class OrderTrackingUrl
{
    public static function forOrder(Order $order): ?string
    {
        if ($order->tracking_number === null || $order->tracking_number === '') {
            return null;
        }

        if ($order->shipping_carrier === null) {
            return null;
        }

        $number = urlencode($order->tracking_number);

        return match ($order->shipping_carrier) {
            ShippingCarrier::Ghtk => "https://khachhang.giaohangtietkiem.vn/web/khach-hang/ma-van-don/{$number}",
            ShippingCarrier::Ghn => "https://donhang.ghn.vn/?order_code={$number}",
            ShippingCarrier::ViettelPost => "https://viettelpost.com.vn/tracking?key={$number}",
            ShippingCarrier::Vnpost => "https://www.vnpost.vn/tra-cuu-van-don?code={$number}",
            ShippingCarrier::JtExpress => "https://jtexpress.vn/vi/tracking?type=track&billcode={$number}",
            ShippingCarrier::Other => null,
        };
    }
}
