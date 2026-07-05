<?php

namespace App\Http\Controllers\Storefront;

use App\Enums\NewsletterSource;
use App\Http\Controllers\Controller;
use App\Http\Requests\Storefront\SubscribeNewsletterRequest;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\RedirectResponse;

class NewsletterController extends Controller
{
    public function store(SubscribeNewsletterRequest $request): RedirectResponse
    {
        $data = $request->validated();

        NewsletterSubscriber::query()->updateOrCreate(
            ['email' => strtolower($data['email'])],
            [
                'source' => NewsletterSource::from($data['source']),
                'subscribed_at' => now(),
            ],
        );

        return back()->with('newsletter', [
            'status' => 'success',
            'message' => __('messages.newsletter_subscribed'),
        ]);
    }
}
