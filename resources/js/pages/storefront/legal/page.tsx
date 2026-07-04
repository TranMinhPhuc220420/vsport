import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import type { StoreProfile } from '@/types/store-profile';

type LegalPageProps = {
    page: 'privacy' | 'shipping' | 'returns' | 'contact';
    seo: SeoData;
};

export default function LegalPage({ page, seo }: LegalPageProps) {
    const { t } = useTranslation('storefront');
    const { storeProfile } = usePage().props as { storeProfile: StoreProfile };
    const paragraphs = t(`legal.${page}.paragraphs`, {
        returnObjects: true,
    }) as string[];

    const hasContactInfo =
        page === 'contact' &&
        (storeProfile.contactEmail ||
            storeProfile.contactPhone ||
            storeProfile.address);

    return (
        <>
            <PageSeo seo={seo} />

            <article className="storefront-container storefront-section max-w-3xl">
                <h1 className="text-heading-xl text-ink">
                    {t(`legal.${page}.title`)}
                </h1>
                <div className="text-body mt-8 space-y-4 text-mute">
                    {paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>

                {hasContactInfo && (
                    <dl className="text-body mt-8 space-y-2 border-t border-hairline pt-6 text-mute">
                        {storeProfile.contactEmail && (
                            <div className="flex gap-2">
                                <dt className="font-medium text-ink">
                                    {t('legal.contact.emailLabel')}
                                </dt>
                                <dd>
                                    <a
                                        href={`mailto:${storeProfile.contactEmail}`}
                                        className="hover:text-ink hover:underline"
                                    >
                                        {storeProfile.contactEmail}
                                    </a>
                                </dd>
                            </div>
                        )}
                        {storeProfile.contactPhone && (
                            <div className="flex gap-2">
                                <dt className="font-medium text-ink">
                                    {t('legal.contact.phoneLabel')}
                                </dt>
                                <dd>
                                    <a
                                        href={`tel:${storeProfile.contactPhone}`}
                                        className="hover:text-ink hover:underline"
                                    >
                                        {storeProfile.contactPhone}
                                    </a>
                                </dd>
                            </div>
                        )}
                        {storeProfile.address && (
                            <div className="flex gap-2">
                                <dt className="font-medium text-ink">
                                    {t('legal.contact.addressLabel')}
                                </dt>
                                <dd>{storeProfile.address}</dd>
                            </div>
                        )}
                    </dl>
                )}
            </article>
        </>
    );
}
