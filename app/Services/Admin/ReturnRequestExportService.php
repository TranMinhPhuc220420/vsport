<?php

namespace App\Services\Admin;

use App\Models\ReturnRequest;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReturnRequestExportService
{
    /**
     * @param  Builder<ReturnRequest>  $query
     */
    public function streamCsv(Builder $query, string $filename = 'return-requests.csv'): StreamedResponse
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
                'id',
                'order_number',
                'status',
                'customer_name',
                'customer_email',
                'reason',
                'item_count',
                'requested_at',
                'resolved_at',
            ]);

            $query
                ->with(['order', 'user', 'items'])
                ->orderByDesc('created_at')
                ->chunk(100, function ($returnRequests) use ($handle): void {
                    foreach ($returnRequests as $returnRequest) {
                        /** @var ReturnRequest $returnRequest */
                        fputcsv($handle, [
                            $returnRequest->id,
                            $returnRequest->order?->order_number ?? '',
                            $returnRequest->status->value,
                            $returnRequest->user?->name ?? '',
                            $returnRequest->user?->email ?? '',
                            $returnRequest->reason,
                            $returnRequest->items->sum('quantity'),
                            $returnRequest->requested_at?->toIso8601String() ?? '',
                            $returnRequest->resolved_at?->toIso8601String() ?? '',
                        ]);
                    }
                });

            fclose($handle);
        }, 200, $headers);
    }
}
