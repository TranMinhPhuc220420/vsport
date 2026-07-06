<?php

namespace App\Services\Admin;

use App\Models\SiteSetting;

class ReturnPolicySettingsService
{
    private const KEY = 'return_policy';

    /**
     * @return array{returnsEnabled: bool, returnsWindowDays: int}
     */
    public function settings(): array
    {
        $stored = SiteSetting::getValue(self::KEY, self::defaults());

        return [
            'returnsEnabled' => (bool) ($stored['returnsEnabled'] ?? true),
            'returnsWindowDays' => (int) ($stored['returnsWindowDays'] ?? 30),
        ];
    }

    /**
     * @param  array{returnsEnabled?: bool, returnsWindowDays?: int}  $payload
     * @return array{returnsEnabled: bool, returnsWindowDays: int}
     */
    public function update(array $payload): array
    {
        $settings = [
            'returnsEnabled' => (bool) ($payload['returnsEnabled'] ?? false),
            'returnsWindowDays' => (int) ($payload['returnsWindowDays'] ?? 30),
        ];

        SiteSetting::setValue(self::KEY, $settings);

        return $settings;
    }

    /**
     * @return array{returnsEnabled: bool, returnsWindowDays: int}
     */
    private static function defaults(): array
    {
        return [
            'returnsEnabled' => true,
            'returnsWindowDays' => 30,
        ];
    }
}
