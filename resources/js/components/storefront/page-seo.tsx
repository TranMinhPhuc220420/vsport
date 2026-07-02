import { Head } from '@inertiajs/react';

export type SeoData = {
    title: string;
    description: string;
    canonical: string;
    ogImage?: string | null;
    robots?: string | null;
};

type PageSeoProps = {
    seo: SeoData;
};

export function PageSeo({ seo }: PageSeoProps) {
    return (
        <Head title={seo.title}>
            <meta
                head-key="description"
                name="description"
                content={seo.description}
            />
            <link head-key="canonical" rel="canonical" href={seo.canonical} />
            <meta head-key="og:title" property="og:title" content={seo.title} />
            <meta
                head-key="og:description"
                property="og:description"
                content={seo.description}
            />
            {seo.ogImage ? (
                <meta
                    head-key="og:image"
                    property="og:image"
                    content={seo.ogImage}
                />
            ) : null}
            {seo.robots ? (
                <meta head-key="robots" name="robots" content={seo.robots} />
            ) : null}
        </Head>
    );
}
