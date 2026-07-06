import { Link, usePage } from '@inertiajs/react';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TiktokIcon } from '@/components/icons/tiktok-icon';
import type { StoreProfile } from '@/types/store-profile';

type FooterLink = {
    label: string;
    href: string;
};

type FooterColumn = {
    title: string;
    links: FooterLink[];
};

export function StorefrontFooter() {
    const { t } = useTranslation('storefront');
    const { storeProfile, name: storeName } = usePage().props as unknown as {
        storeProfile: StoreProfile;
        name: string;
    };

    const footerColumns = useMemo(
        (): FooterColumn[] => [
            {
                title: t('footer.help'),
                links: [
                    { label: t('footer.orderStatus'), href: '/orders' },
                    {
                        label: t('footer.orderLookup'),
                        href: '/orders/lookup',
                    },
                    {
                        label: t('footer.trackOrder'),
                        href: '/orders/track',
                    },
                    { label: t('footer.shipping'), href: '/shipping' },
                    { label: t('footer.returns'), href: '/returns' },
                    { label: t('footer.privacy'), href: '/privacy' },
                    { label: t('footer.contactUs'), href: '/contact' },
                ],
            },
            {
                title: t('footer.company'),
                links: [
                    { label: t('footer.about'), href: '/contact' },
                    { label: t('footer.news'), href: '/blog' },
                ],
            },
        ],
        [t],
    );

    const hasContactInfo =
        storeProfile.contactEmail ||
        storeProfile.contactPhone ||
        storeProfile.address;

    const socialLinks = [
        { href: storeProfile.facebookUrl, Icon: Facebook, label: 'Facebook' },
        {
            href: storeProfile.instagramUrl,
            Icon: Instagram,
            label: 'Instagram',
        },
        { href: storeProfile.tiktokUrl, Icon: TiktokIcon, label: 'TikTok' },
        { href: storeProfile.youtubeUrl, Icon: Youtube, label: 'YouTube' },
    ].filter((social) => Boolean(social.href));

    return (
        <footer className="vsport-light border-t border-hairline bg-canvas pb-[var(--storefront-safe-bottom,0px)] text-mute">
            <div className="storefront-container storefront-section">
                <div className="grid grid-cols-1 gap-8 tablet:grid-cols-3">
                    {footerColumns.map((column) => (
                        <div key={column.title}>
                            <h2 className="text-body-strong mb-4 text-ink">
                                {column.title}
                            </h2>
                            <ul className="flex flex-col gap-3">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-caption-md hover:text-ink hover:underline"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {(hasContactInfo || socialLinks.length > 0) && (
                        <div>
                            <h2 className="text-body-strong mb-4 text-ink">
                                {t('footer.contactTitle')}
                            </h2>
                            <ul className="flex flex-col gap-3">
                                {storeProfile.contactEmail && (
                                    <li>
                                        <a
                                            href={`mailto:${storeProfile.contactEmail}`}
                                            className="text-caption-md hover:text-ink hover:underline"
                                        >
                                            {storeProfile.contactEmail}
                                        </a>
                                    </li>
                                )}
                                {storeProfile.contactPhone && (
                                    <li>
                                        <a
                                            href={`tel:${storeProfile.contactPhone}`}
                                            className="text-caption-md hover:text-ink hover:underline"
                                        >
                                            {storeProfile.contactPhone}
                                        </a>
                                    </li>
                                )}
                                {storeProfile.address && (
                                    <li className="text-caption-md">
                                        {storeProfile.address}
                                    </li>
                                )}
                            </ul>

                            {socialLinks.length > 0 && (
                                <div className="mt-5 flex items-center gap-3">
                                    {socialLinks.map(
                                        ({ href, Icon, label }) => (
                                            <a
                                                key={label}
                                                href={href ?? undefined}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                aria-label={label}
                                                className="text-mute hover:text-ink"
                                            >
                                                <Icon className="size-5" />
                                            </a>
                                        ),
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="text-caption-sm mt-10 border-t border-hairline pt-6">
                    <p>
                        {t('footer.copyright', {
                            year: new Date().getFullYear(),
                            storeName: storeProfile.name || storeName,
                        })}
                    </p>
                </div>
            </div>
        </footer>
    );
}
