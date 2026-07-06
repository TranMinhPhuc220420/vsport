import { Head } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { Appearance } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function StorefrontAppearanceSettings() {
    const { t } = useTranslation('storefront');
    const { appearance, updateAppearance } = useAppearance();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: t('settings.appearance.light') },
        { value: 'dark', icon: Moon, label: t('settings.appearance.dark') },
        {
            value: 'system',
            icon: Monitor,
            label: t('settings.appearance.system'),
        },
    ];

    return (
        <>
            <Head title={t('settings.appearance.pageTitle')} />

            <section
                aria-labelledby="appearance-section-heading"
                className="space-y-6 border border-hairline p-6"
            >
                <div>
                    <h2
                        id="appearance-section-heading"
                        className="text-heading-md text-ink"
                    >
                        {t('settings.appearance.sectionTitle')}
                    </h2>
                    <p className="text-caption-md mt-1 text-mute">
                        {t('settings.appearance.sectionDescription')}
                    </p>
                </div>

                <div className="inline-flex gap-1 rounded-pill-md border border-hairline p-1">
                    {tabs.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => updateAppearance(value)}
                            className={cn(
                                'text-caption-md flex items-center gap-1.5 rounded-pill-md px-4 py-2 transition-colors',
                                appearance === value
                                    ? 'bg-soft-cloud text-ink'
                                    : 'text-mute hover:text-ink',
                            )}
                        >
                            <Icon className="size-4" aria-hidden />
                            {label}
                        </button>
                    ))}
                </div>
            </section>
        </>
    );
}
