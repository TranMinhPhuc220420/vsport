<?php

namespace App\Services\Admin;

use App\Models\NewsletterSubscriber;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NewsletterSubscriberExportService
{
    /**
     * @param  Builder<NewsletterSubscriber>  $query
     */
    public function streamCsv(Builder $query, string $filename = 'newsletter-subscribers.csv'): StreamedResponse
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

            fputcsv($handle, ['email', 'source', 'subscribed_at']);

            $query->orderByDesc('subscribed_at')->chunk(100, function ($subscribers) use ($handle): void {
                foreach ($subscribers as $subscriber) {
                    /** @var NewsletterSubscriber $subscriber */
                    fputcsv($handle, [
                        $subscriber->email,
                        $subscriber->source->value,
                        $subscriber->subscribed_at->toIso8601String(),
                    ]);
                }
            });

            fclose($handle);
        }, 200, $headers);
    }
}
