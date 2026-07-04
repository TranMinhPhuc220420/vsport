import { Link } from '@inertiajs/react';

import { StorefrontButton } from '@/components/storefront/Button';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { cn } from '@/lib/utils';

type EditorialBannerProps = {
    headline: string;
    subtitle: string;
    imageUrl: string;
    ctaLabel: string;
    ctaHref: string;
    className?: string;
};

function EditorialBanner({
    headline,
    subtitle,
    imageUrl,
    ctaLabel,
    ctaHref,
    className,
}: EditorialBannerProps) {
    return (
        <section
            data-slot="editorial-banner"
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

            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-transparent" />

            <div className="storefront-container absolute inset-0 z-10 flex flex-col justify-end pb-8 tablet:pb-12">
                <ScrollReveal delay={80}>
                    <p className="text-caption-md text-canvas/80">{subtitle}</p>
                    <h2 className="text-display-campaign mt-2 max-w-3xl text-canvas">
                        {headline}
                    </h2>
                    <div className="mt-6 w-fit">
                        <StorefrontButton variant="outline-on-image" asChild>
                            <Link href={ctaHref}>{ctaLabel}</Link>
                        </StorefrontButton>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

export { EditorialBanner };
