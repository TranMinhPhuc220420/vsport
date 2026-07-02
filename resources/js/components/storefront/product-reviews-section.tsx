import { router, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { StarRating } from '@/components/storefront/star-rating';
import { cn } from '@/lib/utils';

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

function buildDistribution(reviews: ProductReview[]) {
    const counts = [0, 0, 0, 0, 0];

    reviews.forEach((review) => {
        const index = Math.min(Math.max(review.rating, 1), 5) - 1;
        counts[index] += 1;
    });

    const total = reviews.length || 1;

    return [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: counts[stars - 1],
        percent: Math.round((counts[stars - 1] / total) * 100),
    }));
}

const inputClassName =
    'text-body-strong h-12 w-full rounded-pill-lg border border-hairline bg-canvas px-4 text-ink outline-none placeholder:text-mute focus:border-ink';

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

    const distribution = useMemo(
        () => buildDistribution(reviews),
        [reviews],
    );

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
        <section id="reviews" className="border-t border-hairline pt-10">
            <h2 className="text-heading-lg text-ink">{t('pdp.reviews')}</h2>

            <div className="mt-6 grid gap-8 tablet:grid-cols-[minmax(0,12rem)_1fr]">
                <div className="flex flex-col gap-2">
                    <p className="text-display-campaign text-ink">
                        {averageRating.toFixed(1)}
                    </p>
                    <StarRating
                        rating={averageRating}
                        size="md"
                        showCount
                        reviewCount={reviewCount}
                    />
                </div>

                <div className="space-y-2">
                    {distribution.map((row) => (
                        <div
                            key={row.stars}
                            className="flex items-center gap-3"
                        >
                            <span className="text-caption-md w-8 text-mute">
                                {t('pdp.starLabel', { n: row.stars })}
                            </span>
                            <div className="h-1.5 flex-1 bg-soft-cloud">
                                <div
                                    className="h-full bg-ink transition-all duration-300 ease-[var(--motion-ease)]"
                                    style={{ width: `${row.percent}%` }}
                                />
                            </div>
                            <span className="text-caption-md w-8 text-right text-mute">
                                {row.count}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <ul className="mt-8 space-y-4">
                {reviews.map((review) => (
                    <li
                        key={review.id}
                        className="border-b border-hairline-soft pb-6"
                    >
                        <StarRating rating={review.rating} size="sm" />
                        {review.title && (
                            <p className="text-body-strong mt-2 text-ink">
                                {review.title}
                            </p>
                        )}
                        {review.body && (
                            <p className="text-caption-md mt-2 text-mute">
                                {review.body}
                            </p>
                        )}
                        {review.authorName && (
                            <p className="text-caption-md mt-2 text-mute">
                                {review.authorName}
                            </p>
                        )}
                    </li>
                ))}
            </ul>

            {auth?.user ? (
                <form onSubmit={submitReview} className="mt-8 space-y-4">
                    <h3 className="text-heading-md text-ink">
                        {t('pdp.writeReview')}
                    </h3>
                    <label className="text-caption-md block text-ink">
                        {t('pdp.yourRating')}
                        <select
                            value={rating}
                            onChange={(event) =>
                                setRating(Number(event.target.value))
                            }
                            className={cn(inputClassName, 'mt-1')}
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
                        onChange={(event) => setTitle(event.target.value)}
                        className={inputClassName}
                    />
                    <textarea
                        placeholder={t('pdp.reviewBody')}
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        rows={4}
                        className={cn(
                            inputClassName,
                            'h-auto min-h-[8rem] py-3',
                        )}
                    />
                    <StorefrontButton type="submit" disabled={processing}>
                        {t('pdp.submitReview')}
                    </StorefrontButton>
                </form>
            ) : (
                <p className="text-caption-md mt-6 text-mute">
                    {t('pdp.signInToReview')}
                </p>
            )}
        </section>
    );
}
