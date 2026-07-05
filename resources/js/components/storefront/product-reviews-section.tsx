import { Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
    StorefrontButton,
    storefrontButtonVariants,
} from '@/components/storefront/Button';
import {
    CheckoutField,
    checkoutInputClassName,
} from '@/components/storefront/checkout-form';
import { StarRating } from '@/components/storefront/star-rating';
import { StarRatingInput } from '@/components/storefront/star-rating-input';
import { formatDate, useLocale } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';
import type { ProductReview } from '@/types/catalog';

type ProductReviewsSectionProps = {
    productSlug: string;
    averageRating: number;
    reviewCount: number;
    reviews?: ProductReview[];
    viewerReview?: ProductReview | null;
};

const TITLE_MAX = 150;
const BODY_MAX = 5000;

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

function ReviewCard({ review }: { review: ProductReview }) {
    const { t } = useTranslation('storefront');
    const { locale } = useLocale();

    return (
        <li className="rounded-pill-md border border-hairline-soft bg-canvas p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <StarRating rating={review.rating} size="sm" />
                {review.createdAt && (
                    <time
                        dateTime={review.createdAt}
                        className="text-caption-sm text-mute"
                    >
                        {formatDate(review.createdAt, locale)}
                    </time>
                )}
            </div>
            {review.title && (
                <p className="text-body-strong mt-3 text-ink">{review.title}</p>
            )}
            {review.body && (
                <p className="text-body-md mt-2 text-charcoal">{review.body}</p>
            )}
            {review.authorName && (
                <p className="text-caption-md mt-3 text-mute">
                    {t('pdp.reviewAuthor', { name: review.authorName })}
                </p>
            )}
        </li>
    );
}

type ReviewFormProps = {
    productSlug: string;
    viewerReview: ProductReview | null;
};

function ReviewForm({ productSlug, viewerReview }: ReviewFormProps) {
    const { t } = useTranslation('storefront');
    const isEditing = viewerReview !== null;
    const isPending = isEditing && viewerReview.isApproved === false;

    const { data, setData, post, processing, errors } = useForm({
        rating: viewerReview?.rating ?? 5,
        title: viewerReview?.title ?? '',
        body: viewerReview?.body ?? '',
    });

    const submitReview = (event: FormEvent) => {
        event.preventDefault();

        post(`/products/${productSlug}/reviews`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="mt-8 rounded-pill-md border border-hairline-soft bg-soft-cloud p-6 tablet:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-heading-md text-ink">
                        {isEditing
                            ? t('pdp.updateReview')
                            : t('pdp.writeReview')}
                    </h3>
                    <p className="text-caption-md mt-1 text-mute">
                        {isEditing
                            ? t('pdp.updateReviewHint')
                            : t('pdp.writeReviewHint')}
                    </p>
                </div>
                {isPending && (
                    <span className="text-caption-sm rounded-pill-md border border-hairline bg-canvas px-3 py-1 text-mute">
                        {t('pdp.reviewPendingModeration')}
                    </span>
                )}
            </div>

            <form onSubmit={submitReview} className="mt-6 space-y-5">
                <CheckoutField
                    id="review-rating"
                    label={t('pdp.yourRating')}
                    error={errors.rating}
                >
                    <StarRatingInput
                        id="review-rating"
                        value={data.rating}
                        onChange={(rating) => setData('rating', rating)}
                    />
                </CheckoutField>

                <CheckoutField
                    id="review-title"
                    label={t('pdp.reviewTitleLabel')}
                    error={errors.title}
                >
                    <input
                        id="review-title"
                        type="text"
                        placeholder={t('pdp.reviewTitle')}
                        value={data.title}
                        maxLength={TITLE_MAX}
                        onChange={(event) =>
                            setData('title', event.target.value)
                        }
                        className={checkoutInputClassName}
                    />
                    <p className="text-caption-sm text-right text-mute">
                        {t('pdp.characterCount', {
                            current: data.title.length,
                            max: TITLE_MAX,
                        })}
                    </p>
                </CheckoutField>

                <CheckoutField
                    id="review-body"
                    label={t('pdp.reviewBodyLabel')}
                    error={errors.body}
                >
                    <textarea
                        id="review-body"
                        placeholder={t('pdp.reviewBody')}
                        value={data.body}
                        maxLength={BODY_MAX}
                        onChange={(event) =>
                            setData('body', event.target.value)
                        }
                        rows={5}
                        className={cn(
                            checkoutInputClassName,
                            'min-h-[10rem] resize-y',
                        )}
                    />
                    <p className="text-caption-sm text-right text-mute">
                        {t('pdp.characterCount', {
                            current: data.body.length,
                            max: BODY_MAX,
                        })}
                    </p>
                </CheckoutField>

                <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
                    <p className="text-caption-sm text-mute">
                        {t('pdp.moderationNote')}
                    </p>
                    <StorefrontButton
                        type="submit"
                        disabled={processing}
                        className="tablet:shrink-0"
                    >
                        {processing
                            ? t('pdp.submittingReview')
                            : isEditing
                              ? t('pdp.updateReviewCta')
                              : t('pdp.submitReview')}
                    </StorefrontButton>
                </div>
            </form>
        </div>
    );
}

function GuestReviewPrompt() {
    const { t } = useTranslation('storefront');

    return (
        <div className="mt-8 rounded-pill-md border border-hairline-soft bg-soft-cloud p-6 text-center tablet:p-8">
            <p className="text-body-strong text-ink">
                {t('pdp.signInToReview')}
            </p>
            <p className="text-caption-md mt-2 text-mute">
                {t('pdp.signInToReviewHint')}
            </p>
            <Link
                href="/login"
                className={cn(
                    storefrontButtonVariants({ variant: 'primary' }),
                    'mt-5',
                )}
            >
                {t('pdp.signInCta')}
            </Link>
        </div>
    );
}

function ProductReviewsSection({
    productSlug,
    averageRating,
    reviewCount,
    reviews = [],
    viewerReview = null,
}: ProductReviewsSectionProps) {
    const { t } = useTranslation('storefront');
    const { auth } = usePage().props as { auth?: { user?: unknown } };
    const distribution = useMemo(
        () => buildDistribution(reviews),
        [reviews],
    );

    return (
        <section id="reviews" className="border-hairline pt-10">
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
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-soft-cloud">
                                <div
                                    className="h-full rounded-full bg-ink transition-all duration-300 ease-[var(--motion-ease)]"
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

            {reviews.length > 0 ? (
                <ul className="mt-8 grid gap-4">
                    {reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </ul>
            ) : (
                <p className="text-body-md mt-8 text-mute">
                    {t('pdp.noReviewsYet')}
                </p>
            )}

            {auth?.user ? (
                <ReviewForm
                    key={viewerReview?.id ?? 'new'}
                    productSlug={productSlug}
                    viewerReview={viewerReview}
                />
            ) : (
                <GuestReviewPrompt />
            )}
        </section>
    );
}

export { ProductReviewsSection };
export default ProductReviewsSection;
