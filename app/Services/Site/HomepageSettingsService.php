<?php

namespace App\Services\Site;

use App\Data\HomepageCampaign;
use App\Models\SiteSetting;

class HomepageSettingsService
{
    private const CAMPAIGNS_KEY = 'homepage_campaigns';

    private const LEGACY_CAMPAIGN_KEY = 'homepage_campaign';

    /**
     * The list of hero campaigns shown on the storefront.
     *
     * @return list<HomepageCampaign>
     */
    public function campaigns(): array
    {
        $stored = SiteSetting::getValue(self::CAMPAIGNS_KEY);
        $items = $stored['campaigns'] ?? null;

        if (is_array($items) && $items !== []) {
            return array_map(
                fn ($item): HomepageCampaign => HomepageCampaign::fromArray((array) $item),
                array_values($items),
            );
        }

        // Backward compatibility with the previous single-campaign setting.
        $legacy = SiteSetting::getValue(self::LEGACY_CAMPAIGN_KEY);

        if ($legacy !== []) {
            return [HomepageCampaign::fromArray($legacy)];
        }

        return [HomepageCampaign::defaults()];
    }

    /**
     * The primary (first) hero campaign.
     */
    public function campaign(): HomepageCampaign
    {
        return $this->campaigns()[0] ?? HomepageCampaign::defaults();
    }

    /**
     * @param  list<array<string, mixed>>  $payloads
     * @return list<HomepageCampaign>
     */
    public function updateCampaigns(array $payloads): array
    {
        $campaigns = array_map(
            fn (array $payload): HomepageCampaign => HomepageCampaign::fromArray($payload),
            array_values($payloads),
        );

        SiteSetting::setValue(self::CAMPAIGNS_KEY, [
            'campaigns' => array_map(
                fn (HomepageCampaign $campaign): array => $campaign->toArray(),
                $campaigns,
            ),
        ]);

        return $campaigns;
    }
}
