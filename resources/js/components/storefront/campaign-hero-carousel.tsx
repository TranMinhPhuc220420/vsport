import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

import { CampaignHero } from '@/components/storefront/campaign-hero';
import { cn } from '@/lib/utils';
import type { Campaign } from '@/types/catalog';

type CampaignHeroCarouselProps = {
    campaigns: Campaign[];
    autoplayMs?: number;
    className?: string;
};

function CampaignHeroCarousel({
    campaigns,
    autoplayMs = 6000,
    className,
}: CampaignHeroCarouselProps) {
    const [active, setActive] = useState(0);
    const [progressKey, setProgressKey] = useState(0);
    const count = campaigns.length;

    const goTo = useCallback(
        (index: number) => {
            setActive(((index % count) + count) % count);
            setProgressKey((current) => current + 1);
        },
        [count],
    );

    useEffect(() => {
        if (count <= 1) {
            return;
        }

        const timer = window.setInterval(() => {
            setActive((current) => (current + 1) % count);
            setProgressKey((current) => current + 1);
        }, autoplayMs);

        return () => window.clearInterval(timer);
    }, [count, autoplayMs]);

    if (count === 0) {
        return null;
    }

    const current = campaigns[active];

    if (count === 1) {
        return (
            <CampaignHero
                className={className}
                headline={current.headline}
                subtitle={current.subtitle}
                imageUrl={current.imageUrl}
                ctaLabel={current.ctaLabel}
                ctaHref={current.ctaHref}
            />
        );
    }

    return (
        <div
            data-slot="campaign-hero-carousel"
            className={cn('relative', className)}
        >
            <CampaignHero
                key={active}
                headline={current.headline}
                subtitle={current.subtitle}
                imageUrl={current.imageUrl}
                ctaLabel={current.ctaLabel}
                ctaHref={current.ctaHref}
            />

            <div className="absolute inset-x-0 top-0 h-0.5 bg-canvas/20">
                <div
                    key={progressKey}
                    className="motion-hero-progress h-full origin-left bg-canvas"
                    style={
                        {
                            '--hero-progress-duration': `${autoplayMs}ms`,
                        } as CSSProperties
                    }
                />
            </div>

            <button
                type="button"
                onClick={() => goTo(active - 1)}
                aria-label="Previous slide"
                className="absolute top-1/2 left-4 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/25 text-canvas backdrop-blur transition hover:bg-canvas/40 tablet:flex"
            >
                <ChevronLeft className="size-6" />
            </button>
            <button
                type="button"
                onClick={() => goTo(active + 1)}
                aria-label="Next slide"
                className="absolute top-1/2 right-4 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-canvas/25 text-canvas backdrop-blur transition hover:bg-canvas/40 tablet:flex"
            >
                <ChevronRight className="size-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
                {campaigns.map((campaign, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => goTo(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === active}
                        className={cn(
                            'h-2 rounded-full bg-canvas/50 transition-all duration-300',
                            index === active ? 'w-6 bg-canvas' : 'w-2',
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

export { CampaignHeroCarousel };
