import { Link } from '@inertiajs/react';

import { StorefrontButton } from '@/components/storefront/Button';
import { cn } from '@/lib/utils';

type CampaignHeroProps = {
    headline: string;
    subtitle: string;
    imageUrl: string;
    ctaLabel: string;
    ctaHref: string;
    className?: string;
};

function CampaignHero({
    headline,
    subtitle,
    imageUrl,
    ctaLabel,
    ctaHref,
    className,
}: CampaignHeroProps) {
    return (
        <section
            data-slot="campaign-hero"
            className={cn(
                'relative aspect-[4/5] w-full overflow-hidden tablet:aspect-[16/7]',
                className,
            )}
        >
            <img
                src={imageUrl}
                alt={headline}
                className="motion-hero-ken-burns hidden size-full object-cover tablet:block"
            />
            <img
                src={imageUrl}
                alt={headline}
                className="size-full object-cover tablet:hidden"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/20 to-transparent" />
            <div className="storefront-container absolute inset-0 flex flex-col justify-end pb-8 tablet:pb-12">
                <p
                    className="motion-hero-enter text-caption-md text-canvas/80"
                    style={{ animationDelay: '0ms' }}
                >
                    {subtitle}
                </p>
                <h1
                    className="motion-hero-enter mt-2 text-display-campaign text-canvas"
                    style={{ animationDelay: '80ms' }}
                >
                    {headline}
                </h1>
                <div className="motion-hero-enter mt-6 w-fit" style={{ animationDelay: '160ms' }}>
                    <StorefrontButton variant="outline-on-image" asChild>
                        <Link href={ctaHref}>{ctaLabel}</Link>
                    </StorefrontButton>
                </div>
            </div>
        </section>
    );
}

export { CampaignHero };
