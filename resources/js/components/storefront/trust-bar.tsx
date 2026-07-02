import { Banknote, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { cn } from '@/lib/utils';

type TrustBarProps = {
    className?: string;
};

const trustIcons: LucideIcon[] = [Truck, Banknote, ShieldCheck, RotateCcw];

function TrustBar({ className }: TrustBarProps) {
    const { t } = useTranslation('storefront');
    const items = t('home.trust.items', { returnObjects: true }) as Array<{
        title: string;
        description: string;
    }>;

    return (
        <section
            data-slot="trust-bar"
            className={cn(
                'storefront-container storefront-section-compact',
                className,
            )}
        >
            <ScrollReveal staggerChildren>
                <div className="grid grid-cols-1 gap-6 border-y border-hairline-soft py-8 tablet:grid-cols-2 desktop:grid-cols-4">
                    {items.map((item, index) => {
                        const Icon = trustIcons[index] ?? ShieldCheck;

                        return (
                            <div
                                key={item.title}
                                className="flex flex-col gap-3"
                                style={
                                    {
                                        '--stagger-index': index,
                                    } as CSSProperties
                                }
                            >
                                <Icon
                                    className="size-6 text-ink"
                                    strokeWidth={1.5}
                                    aria-hidden
                                />
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-body-strong text-ink">
                                        {item.title}
                                    </h3>
                                    <p className="text-caption-md text-mute">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </ScrollReveal>
        </section>
    );
}

export { TrustBar };
