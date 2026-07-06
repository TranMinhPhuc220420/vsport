import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { Breadcrumb } from '@/components/storefront/breadcrumb';
import {
    SettingsNav,
    SettingsNavMobile,
    useSettingsNavItems,
} from '@/components/storefront/settings/settings-nav';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import { dashboard, home } from '@/routes';

export default function StorefrontSettingsLayout({
    children,
}: PropsWithChildren) {
    const { t } = useTranslation('storefront');
    const { isCurrentUrl } = useCurrentUrl();
    const navItems = useSettingsNavItems();
    const activeTitle =
        navItems.find((item) => isCurrentUrl(item.href))?.title ??
        navItems[0].title;

    return (
        <div className="storefront-container storefront-section">
            <Breadcrumb
                className="mb-6"
                items={[
                    { label: t('plp.home'), href: toUrl(home()) },
                    { label: t('account.title'), href: toUrl(dashboard()) },
                    { label: activeTitle },
                ]}
            />

            <header className="mb-8 space-y-2">
                <h1 className="text-heading-xl text-ink">
                    {t('settings.title')}
                </h1>
                <p className="text-body-strong text-mute">
                    {t('settings.description')}
                </p>
            </header>

            <SettingsNavMobile className="mb-6" />

            <div className="flex flex-col gap-8 tablet-lg:flex-row tablet-lg:gap-12">
                <aside className="hidden w-48 shrink-0 tablet-lg:block">
                    <SettingsNav />
                </aside>

                <div className="min-w-0 flex-1 tablet-lg:max-w-2xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
