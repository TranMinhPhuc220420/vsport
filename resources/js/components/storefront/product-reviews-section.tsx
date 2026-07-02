import { router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';

type ProductReview = {
    id: number;
    rating: number;
    title: string | null;
    body: string | null;
    authorName?: string;
    createdAt?: string;
};

type ProductReviewsSectionProps = {
    productSlug: string;
    averageRating: number;
    reviewCount: number;
    reviews?: ProductReview[];
};

export function ProductReviewsSection({
    productSlug,
    averageRating,
    reviewCount,
    reviews = [],
}: ProductReviewsSectionProps) {
    const { t } = useTranslation('storefront');
    const { auth } = usePage().props as { auth?: { user?: unknown } };
    const [rating, setRating] = useState(5);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [processing, setProcessing] = useState(false);

    const submitReview = (event: FormEvent) => {
        event.preventDefault();
        setProcessing(true);

        router.post(
            `/products/${productSlug}/reviews`,
            { rating, title, body },
            { onFinish: () => setProcessing(false) },
        );
    };

    return (
        <section className="mt-12 border-t border-hairline pt-10">
            <h2 className="text-heading-lg text-ink">{t('pdp.reviews')}</h2>
            <p className="mt-2 text-caption-md text-mute">
                {t('pdp.ratingSummary', {
                    rating: averageRating.toFixed(1),
                    count: reviewCount,
                })}
            </p>

            <ul className="mt-6 space-y-4">
                {reviews.map((review) => (
                    <li key={review.id} className="border border-hairline p-4">
                        <p className="text-body-strong text-ink">
                            {'★'.repeat(review.rating)}
                            {review.title && ` — ${review.title}`}
                        </p>
                        {review.body && (
                            <p className="mt-2 text-caption-md text-mute">
                                {review.body}
                            </p>
                        )}
                        {review.authorName && (
                            <p className="mt-2 text-caption-md text-mute">
                                {review.authorName}
                            </p>
                        )}
                    </li>
                ))}
            </ul>

            {auth?.user ? (
                <form onSubmit={submitReview} className="mt-8 space-y-4">
                    <label className="block text-caption-md text-ink">
                        {t('pdp.yourRating')}
                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="mt-1 block w-full border border-hairline px-3 py-2"
                        >
                            {[5, 4, 3, 2, 1].map((value) => (
                                <option key={value} value={value}>
                                    {t('pdp.stars', { n: value })}
                                </option>
                            ))}
                        </select>
                    </label>
                    <input
                        type="text"
                        placeholder={t('pdp.reviewTitle')}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border border-hairline px-3 py-2"
                    />
                    <textarea
                        placeholder={t('pdp.reviewBody')}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={4}
                        className="w-full border border-hairline px-3 py-2"
                    />
                    <StorefrontButton type="submit" disabled={processing}>
                        {t('pdp.submitReview')}
                    </StorefrontButton>
                </form>
            ) : (
                <p className="mt-6 text-caption-md text-mute">
                    {t('pdp.signInToReview')}
                </p>
            )}
        </section>
    );
}
