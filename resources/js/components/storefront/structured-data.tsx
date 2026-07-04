import { Head } from '@inertiajs/react';

type StructuredDataProps = {
    data: Record<string, unknown>[];
};

export function StructuredData({ data }: StructuredDataProps) {
    return (
        <Head>
            {data.map((schema, index) => (
                <script
                    key={`structured-data-${index}`}
                    head-key={`structured-data-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schema),
                    }}
                />
            ))}
        </Head>
    );
}
