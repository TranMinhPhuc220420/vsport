import { Head } from '@inertiajs/react';

export type SeoData = {
    title: string;
    description: string;
    canonical: string;
    ogImage?: string | null;
    robots?: string | null;
    ogType?: string;
    ogUrl?: string;
    siteName?: string;
    articlePublishedTime?: string | null;
    articleModifiedTime?: string | null;
    articleAuthor?: string | null;
    prevUrl?: string | null;
    nextUrl?: string | null;
    rssAlternateUrl?: string | null;
};

type PageSeoProps = {
    seo: SeoData;
};

export function PageSeo({ seo }: PageSeoProps) {
    const ogUrl = seo.ogUrl ?? seo.canonical;
    const ogType = seo.ogType ?? 'website';
    const twitterCard = seo.ogImage ? 'summary_large_image' : 'summary';
    const siteName = seo.siteName;

    return (
        <Head title={seo.title}>
            {seo.description ? (
                <>
                    <meta
                        head-key="description"
                        name="description"
                        content={seo.description}
                    />
                    <meta
                        head-key="og:title"
                        property="og:title"
                        content={seo.title}
                    />
                    <meta
                        head-key="og:description"
                        property="og:description"
                        content={seo.description}
                    />
                    <meta
                        head-key="twitter:card"
                        name="twitter:card"
                        content={twitterCard}
                    />
                    <meta
                        head-key="twitter:title"
                        name="twitter:title"
                        content={seo.title}
                    />
                    <meta
                        head-key="twitter:description"
                        name="twitter:description"
                        content={seo.description}
                    />
                </>
            ) : null}
            {siteName ? (
                <meta
                    head-key="og:site_name"
                    property="og:site_name"
                    content={siteName}
                />
            ) : null}
            <link head-key="canonical" rel="canonical" href={seo.canonical} />
            <meta head-key="og:url" property="og:url" content={ogUrl} />
            <meta head-key="og:type" property="og:type" content={ogType} />
            {seo.ogImage ? (
                <>
                    <meta
                        head-key="og:image"
                        property="og:image"
                        content={seo.ogImage}
                    />
                    <meta
                        head-key="twitter:image"
                        name="twitter:image"
                        content={seo.ogImage}
                    />
                </>
            ) : null}
            {seo.articlePublishedTime ? (
                <meta
                    head-key="article:published_time"
                    property="article:published_time"
                    content={seo.articlePublishedTime}
                />
            ) : null}
            {seo.articleModifiedTime ? (
                <meta
                    head-key="article:modified_time"
                    property="article:modified_time"
                    content={seo.articleModifiedTime}
                />
            ) : null}
            {seo.articleAuthor ? (
                <meta
                    head-key="article:author"
                    property="article:author"
                    content={seo.articleAuthor}
                />
            ) : null}
            {seo.robots ? (
                <meta head-key="robots" name="robots" content={seo.robots} />
            ) : null}
            {seo.prevUrl ? (
                <link head-key="prev" rel="prev" href={seo.prevUrl} />
            ) : null}
            {seo.nextUrl ? (
                <link head-key="next" rel="next" href={seo.nextUrl} />
            ) : null}
            {seo.rssAlternateUrl ? (
                <link
                    head-key="rss-alternate"
                    rel="alternate"
                    type="application/rss+xml"
                    href={seo.rssAlternateUrl}
                />
            ) : null}
        </Head>
    );
}
