import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as addressesIndex } from '@/routes/addresses';
import { edit as appearanceEdit } from '@/routes/appearance';
import { edit as profileEdit } from '@/routes/profile';
import { edit as securityEdit } from '@/routes/security';

export type SettingsNavItem = {
    title: string;
    href: string;
};

type SettingsNavProps = {
    items?: SettingsNavItem[];
    className?: string;
};

function useSettingsNavItems(): SettingsNavItem[] {
    const { t } = useTranslation('storefront');

    return [
        { title: t('settings.nav.profile'), href: toUrl(profileEdit()) },
        { title: t('settings.nav.addresses'), href: toUrl(addressesIndex()) },
        { title: t('settings.nav.security'), href: toUrl(securityEdit()) },
        { title: t('settings.nav.appearance'), href: toUrl(appearanceEdit()) },
    ];
}

function SettingsNavLink({
    href,
    active,
    children,
}: {
    href: string;
    active: boolean;
    children: ReactNode;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'text-caption-md block rounded-pill-md px-4 py-2.5 transition-colors',
                active
                    ? 'bg-soft-cloud text-ink'
                    : 'text-mute hover:bg-soft-cloud hover:text-ink',
            )}
            aria-current={active ? 'page' : undefined}
        >
            {children}
        </Link>
    );
}

function SettingsNav({ items, className }: SettingsNavProps) {
    const { t } = useTranslation('storefront');
    const { isCurrentUrl } = useCurrentUrl();
    const defaultItems = useSettingsNavItems();

    const navItems: SettingsNavItem[] = items ?? defaultItems;

    return (
        <nav
            aria-label={t('settings.nav.aria')}
            className={cn('flex flex-col gap-1', className)}
        >
            {navItems.map((item) => (
                <SettingsNavLink
                    key={toUrl(item.href)}
                    href={item.href}
                    active={isCurrentUrl(item.href)}
                >
                    {item.title}
                </SettingsNavLink>
            ))}

            <div className="mt-4 border-t border-hairline pt-4">
                <SettingsNavLink
                    href={toUrl(dashboard())}
                    active={isCurrentUrl(dashboard())}
                >
                    {t('settings.nav.backToAccount')}
                </SettingsNavLink>
            </div>
        </nav>
    );
}

function SettingsNavMobile({ items, className }: SettingsNavProps) {
    const { t } = useTranslation('storefront');
    const { isCurrentUrl } = useCurrentUrl();
    const defaultItems = useSettingsNavItems();

    const navItems: SettingsNavItem[] = items ?? defaultItems;

    return (
        <nav
            aria-label={t('settings.nav.aria')}
            className={cn(
                '-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 scrollbar-none tablet-lg:hidden',
                className,
            )}
        >
            {navItems.map((item) => {
                const active = isCurrentUrl(item.href);

                return (
                    <Link
                        key={toUrl(item.href)}
                        href={item.href}
                        className={cn(
                            'text-caption-md shrink-0 rounded-pill-md px-4 py-2 transition-colors',
                            active
                                ? 'bg-soft-cloud text-ink'
                                : 'border border-hairline text-mute hover:text-ink',
                        )}
                        aria-current={active ? 'page' : undefined}
                    >
                        {item.title}
                    </Link>
                );
            })}
        </nav>
    );
}

export { SettingsNav, SettingsNavMobile, useSettingsNavItems };
