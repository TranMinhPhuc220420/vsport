<?php

namespace App\Data;

use App\Services\Admin\StoreSettingsService;

readonly class HomeStructuredData
{
    /**
     * @return list<array<string, mixed>>
     */
    public static function schemas(): array
    {
        $settings = app(StoreSettingsService::class)->profile();
        $app = config('app.name', 'Zova Sport');
        $name = $settings['name'] ?? $app;
        $url = route('home');

        $organization = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $name,
            'url' => $url,
        ];

        if (! empty($settings['logoUrl'])) {
            $organization['logo'] = $settings['logoUrl'];
        }

        $website = [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => $name,
            'url' => $url,
            'potentialAction' => [
                '@type' => 'SearchAction',
                'target' => [
                    '@type' => 'EntryPoint',
                    'urlTemplate' => route('search.index').'?q={search_term_string}',
                ],
                'query-input' => 'required name=search_term_string',
            ],
        ];

        return [$organization, $website];
    }
}
