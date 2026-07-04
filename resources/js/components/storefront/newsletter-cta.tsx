import { Link } from '@inertiajs/react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { cn } from '@/lib/utils';
import { register } from '@/routes';

type NewsletterCtaProps = {
    className?: string;
};

function NewsletterCta({ className }: NewsletterCtaProps) {
    const { t } = useTranslation('storefront');
    const [email, setEmail] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    };

    return (
        <section
            data-slot="newsletter-cta"
            className={cn('bg-ink text-canvas', className)}
        >
            <div className="storefront-container storefront-section">
                <ScrollReveal direction="up">
                    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                        <p className="text-caption-md text-canvas/70">
                            {t('home.newsletter.eyebrow')}
                        </p>
                        <h2 className="text-display-campaign mt-15 text-canvas">
                            {t('home.newsletter.headline')}
                        </h2>
                        <p className="text-body-strong mt-4 text-canvas/80">
                            {t('home.newsletter.description')}
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 flex w-full flex-col gap-3 tablet:flex-row"
                        >
                            <label htmlFor="newsletter-email" className="sr-only">
                                {t('home.newsletter.emailLabel')}
                            </label>
                            <input
                                id="newsletter-email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                placeholder={t('home.newsletter.emailPlaceholder')}
                                className="text-body-strong h-12 flex-1 rounded-pill-lg border border-canvas/20 bg-canvas/10 px-6 text-canvas outline-none placeholder:text-canvas/50 focus:border-canvas"
                            />
                            <StorefrontButton
                                type="submit"
                                variant="secondary"
                                className="shrink-0 bg-canvas text-ink"
                            >
                                {t('home.newsletter.submit')}
                            </StorefrontButton>
                        </form>

                        <p className="text-caption-md mt-4 text-canvas/60">
                            {t('home.newsletter.or')}{' '}
                            <Link
                                href={register()}
                                className="text-canvas underline"
                            >
                                {t('home.newsletter.createAccount')}
                            </Link>
                        </p>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
}

export { NewsletterCta };
