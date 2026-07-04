<?php

namespace App\Services\Admin;

use App\Models\SiteSetting;

class StoreSettingsService
{
    private const KEY = 'store_profile';

    /**
     * @return array<string, mixed>
     */
    public function profile(): array
    {
        return SiteSetting::getValue(self::KEY, self::defaults());
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function updateProfile(array $payload): array
    {
        SiteSetting::setValue(self::KEY, $payload);

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    private static function defaults(): array
    {
        return [
            'name' => config('app.name'),
            'logoUrl' => null,
            'logoWideUrl' => null,
            'shortDescription' => '',
            'contactEmail' => config('mail.from.address'),
            'contactPhone' => '',
            'address' => '',
            'facebookUrl' => null,
            'instagramUrl' => null,
            'tiktokUrl' => null,
            'youtubeUrl' => null,
            'currency' => 'USD',
        ];
    }
}
