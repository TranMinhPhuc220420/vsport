import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

type BrandMarqueeProps = {
    className?: string;
};

function BrandMarquee({ className }: BrandMarqueeProps) {
    const { t } = useTranslation('storefront');
    const items = t('home.marquee.items', { returnObjects: true }) as string[];
    const sequence = [...items, ...items];

    return (
        <section
            data-slot="brand-marquee"
            aria-hidden
            className={cn(
                'overflow-hidden border-y border-hairline-soft bg-soft-cloud py-3',
                className,
            )}
        >
            <div className="motion-marquee-track flex w-max items-center gap-8">
                {sequence.map((item, index) => (
                    <span
                        key={`${item}-${index}`}
                        className="text-display-campaign shrink-0 text-ink/15"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </section>
    );
}

export { BrandMarquee };
