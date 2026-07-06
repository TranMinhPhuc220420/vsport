<?php

namespace App\Http\Controllers\Admin;

use App\Enums\NewsletterSource;
use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use App\Services\Admin\AdminActivityService;
use App\Services\Admin\NewsletterSubscriberExportService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NewsletterSubscriberController extends Controller
{
    public function __construct(
        private readonly NewsletterSubscriberExportService $export,
        private readonly AdminActivityService $activity,
    ) {}

    public function index(Request $request): Response
    {
        $source = $request->query('source');

        $subscribers = $this->filteredQuery(is_string($source) ? $source : null)
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('admin/newsletter-subscribers/index', [
            'subscribers' => [
                'data' => collect($subscribers->items())->map(fn (NewsletterSubscriber $subscriber) => [
                    'id' => $subscriber->id,
                    'email' => $subscriber->email,
                    'source' => $subscriber->source->value,
                    'subscribedAt' => $subscriber->subscribed_at->toIso8601String(),
                ])->values()->all(),
                'links' => [
                    'first' => $subscribers->url(1),
                    'last' => $subscribers->url($subscribers->lastPage()),
                    'prev' => $subscribers->previousPageUrl(),
                    'next' => $subscribers->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $subscribers->currentPage(),
                    'last_page' => $subscribers->lastPage(),
                    'total' => $subscribers->total(),
                ],
            ],
            'filters' => [
                'source' => is_string($source) ? $source : null,
            ],
            'sourceOptions' => array_column(NewsletterSource::cases(), 'value'),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $source = $request->query('source');

        $this->activity->log(
            $request->user(),
            'newsletter_subscribers.export',
            properties: [
                'source' => is_string($source) ? $source : null,
            ],
            request: $request,
        );

        return $this->export->streamCsv(
            $this->filteredQuery(is_string($source) ? $source : null),
        );
    }

    /**
     * @return Builder<NewsletterSubscriber>
     */
    private function filteredQuery(?string $source): Builder
    {
        $query = NewsletterSubscriber::query()->latest('subscribed_at');

        if ($source !== null && NewsletterSource::tryFrom($source) !== null) {
            $query->where('source', $source);
        }

        return $query;
    }
}
