<?php

namespace App\Data;

readonly class HomepageCampaign
{
    public function __construct(
        public string $headline,
        public string $subtitle,
        public string $imageUrl,
        public string $ctaLabel,
        public string $ctaHref,
    ) {}

    /**
     * @return array{headline: string, subtitle: string, imageUrl: string, ctaLabel: string, ctaHref: string}
     */
    public function toArray(): array
    {
        return [
            'headline' => $this->headline,
            'subtitle' => $this->subtitle,
            'imageUrl' => $this->imageUrl,
            'ctaLabel' => $this->ctaLabel,
            'ctaHref' => $this->ctaHref,
        ];
    }

    public static function defaults(): self
    {
        return new self(
            headline: 'Trail Running',
            subtitle: 'Built for the mountains',
            imageUrl: 'https://images.pexels.com/photos/47354/the-ball-stadion-football-the-pitch-47354.jpeg',
            ctaLabel: 'Shop Men',
            ctaHref: '/men',
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        $defaults = self::defaults();

        return new self(
            headline: (string) ($data['headline'] ?? $defaults->headline),
            subtitle: (string) ($data['subtitle'] ?? $defaults->subtitle),
            imageUrl: (string) ($data['imageUrl'] ?? $defaults->imageUrl),
            ctaLabel: (string) ($data['ctaLabel'] ?? $defaults->ctaLabel),
            ctaHref: (string) ($data['ctaHref'] ?? $defaults->ctaHref),
        );
    }
}
