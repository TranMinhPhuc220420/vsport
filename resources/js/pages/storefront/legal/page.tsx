import { useTranslation } from 'react-i18next';

import { PageSeo, type SeoData } from '@/components/storefront/page-seo';

type LegalPageProps = {
    page: 'privacy' | 'shipping' | 'returns' | 'contact';
    seo: SeoData;
};

export default function LegalPage({ page, seo }: LegalPageProps) {
    const { t } = useTranslation('storefront');
    const paragraphs = t(`legal.${page}.paragraphs`, {
        returnObjects: true,
    }) as string[];

    return (
        <>
            <PageSeo seo={seo} />

            <article className="storefront-container storefront-section max-w-3xl">
                <h1 className="text-heading-xl text-ink">
                    {t(`legal.${page}.title`)}
                </h1>
                <div className="mt-8 space-y-4 text-body text-mute">
                    {paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </article>
        </>
    );
}
