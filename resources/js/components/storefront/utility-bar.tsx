import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { LanguageSwitcher } from '@/components/language-switcher';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { cn } from '@/lib/utils';
import { login, register } from '@/routes';
import { dashboard } from '@/routes';

export function UtilityBar() {
    const { auth } = usePage().props;
    const { t } = useTranslation('storefront');
    const scrollDirection = useScrollDirection();
    const hidden = scrollDirection === 'down';

    const utilityLinks = [
        { label: t('nav.help'), href: '/shipping' },
        { label: t('nav.joinUs'), href: register() },
    ];

    return (
        <div
            className={cn(
                'vsport-light grid overflow-hidden bg-soft-cloud text-ink transition-[grid-template-rows] duration-300 ease-[var(--motion-ease)]',
                hidden ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
            )}
            aria-hidden={hidden}
        >
            <div
                className={cn(
                    'min-h-0 overflow-hidden',
                    hidden && 'pointer-events-none',
                )}
            >
                <div className="storefront-container text-caption-sm flex h-9 items-center justify-end gap-4">
                {utilityLinks.map((link) => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className="hover:underline"
                    >
                        {link.label}
                    </Link>
                ))}
                <span className="text-mute" aria-hidden>
                    ·
                </span>
                <LanguageSwitcher compact />
                <span className="text-mute" aria-hidden>
                    ·
                </span>
                {auth.user ? (
                    <>
                        <Link href="/orders" className="hover:underline">
                            {t('nav.orders')}
                        </Link>
                        <Link href={dashboard()} className="hover:underline">
                            {t('nav.account')}
                        </Link>
                    </>
                ) : (
                    <Link href={login()} className="hover:underline">
                        {t('nav.signIn')}
                    </Link>
                )}
                </div>
            </div>
        </div>
    );
}
