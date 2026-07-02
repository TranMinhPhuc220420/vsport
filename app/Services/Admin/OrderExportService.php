<?php

namespace App\Services\Admin;

use App\Models\Order;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderExportService
{
    /**
     * @param  Builder<Order>  $query
     */
    public function streamCsv(Builder $query, string $filename = 'orders.csv'): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        return response()->stream(function () use ($query): void {
            $handle = fopen('php://output', 'w');

            if ($handle === false) {
                return;
            }

            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'order_number',
                'status',
                'customer_name',
                'customer_email',
                'customer_phone',
                'total_amount',
                'discount_amount',
                'payment_method',
                'created_at',
            ]);

            $query->with('user')->orderByDesc('created_at')->chunk(100, function ($orders) use ($handle): void {
                foreach ($orders as $order) {
                    /** @var Order $order */
                    $shipping = json_decode($order->shipping_address, true);
                    $shipping = is_array($shipping) ? $shipping : [];

                    fputcsv($handle, [
                        $order->order_number,
                        $order->status->value,
                        $shipping['name'] ?? '',
                        $order->user?->email ?? ($shipping['email'] ?? ''),
                        $shipping['phone'] ?? '',
                        (float) $order->total_amount,
                        (float) $order->discount_amount,
                        $order->payment_method->value,
                        $order->created_at?->toIso8601String() ?? '',
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
