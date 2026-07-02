import { Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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

    const footerColumns = useMemo(
        (): FooterColumn[] => [
            {
                title: t('footer.help'),
                links: [
                    { label: t('footer.orderStatus'), href: '/orders' },
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
                ],
            },
        ],
        [t],
    );

    return (
        <footer className="vsport-light border-t border-hairline bg-canvas text-mute">
            <div className="storefront-container storefront-section">
                <div className="grid grid-cols-1 gap-8 tablet:grid-cols-2">
                    {footerColumns.map((column) => (
                        <div key={column.title}>
                            <h2 className="mb-4 text-body-strong text-ink">
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
                </div>

                <div className="mt-10 border-t border-hairline pt-6 text-caption-sm">
                    <p>
                        {t('footer.copyright', {
                            year: new Date().getFullYear(),
                        })}
                    </p>
                </div>
            </div>
        </footer>
    );
}
