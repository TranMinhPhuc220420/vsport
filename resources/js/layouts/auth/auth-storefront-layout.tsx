import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AuthBenefitsList } from '@/components/storefront/auth/auth-benefits-list';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import type { StoreProfile } from '@/types/store-profile';
import { cn } from '@/lib/utils';

export default function AuthStorefrontLayout({
    children,
    title = '',
    description = '',
    editorialHeadline,
    editorialImage,
    editorialBenefits = [],
}: AuthLayoutProps) {
    const { t } = useTranslation('auth');
    const { storeProfile } = usePage().props as {
        storeProfile: StoreProfile;
    };

    const logoUrl = storeProfile.logoWideUrl ?? storeProfile.logoUrl;
    const headline = editorialHeadline ?? title;

    return (
        <div className="vsport-light min-h-dvh bg-canvas text-ink">
            <div className="tablet-lg:grid tablet-lg:min-h-dvh tablet-lg:grid-cols-2">
                <aside
                    className={cn(
                        'relative hidden overflow-hidden tablet-lg:flex tablet-lg:flex-col tablet-lg:justify-end',
                        !editorialImage && 'bg-ink',
                    )}
                    aria-hidden
                >
                    {editorialImage ? (
                        <>
                            <img
                                src={editorialImage}
                                alt=""
                                className="absolute inset-0 size-full object-cover"
                            />
                            <div className="absolute inset-0 bg-ink/40" />
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-ink via-charcoal to-ash" />
                    )}

                    <div className="relative z-10 p-10 desktop:p-16">
                        <p className="text-display-campaign max-w-lg text-canvas">
                            {headline}
                        </p>
                        {description && (
                            <p className="text-body-strong mt-4 max-w-md text-canvas/80">
                                {description}
                            </p>
                        )}
                        <AuthBenefitsList benefits={editorialBenefits} />
                    </div>
                </aside>

                <div className="flex min-h-dvh flex-col">
                    <header className="storefront-container flex h-16 items-center justify-between py-4">
                        <Link
                            href={home()}
                            className="inline-flex items-center"
                        >
                            {logoUrl ? (
                                <img
                                    src={logoUrl}
                                    alt={storeProfile.name}
                                    className="h-8 w-auto max-w-[8rem] object-contain"
                                />
                            ) : (
                                <span className="text-heading-md text-ink">
                                    {storeProfile.name}
                                </span>
                            )}
                        </Link>

                        <Link
                            href={home()}
                            className="text-caption-md inline-flex items-center gap-2 text-mute transition-colors hover:text-ink"
                        >
                            <ArrowLeft className="size-4" aria-hidden />
                            {t('layout.backToStore')}
                        </Link>
                    </header>

                    <main className="flex flex-1 items-center justify-center px-4 pb-10 tablet-lg:px-10">
                        <div className="w-full max-w-[26.25rem]">
                            <div className="mb-8 space-y-2 tablet-lg:mb-10">
                                <h1 className="text-heading-xl text-ink">
                                    {title}
                                </h1>
                                <p className="text-body-strong text-mute">
                                    {description}
                                </p>
                            </div>

                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
