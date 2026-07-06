import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import {
    AuthAlert,
    AuthField,
    AuthInput,
    StorefrontButton,
} from '@/components/storefront';
import { DeleteAccountSection } from '@/components/storefront/settings/delete-account-section';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth & { user: NonNullable<Auth['user']> };
};

function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');
}

export default function StorefrontProfileSettings({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { t } = useTranslation('storefront');
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    return (
        <>
            <Head title={t('settings.profile.pageTitle')} />

            <div className="space-y-10">
                <section
                    aria-labelledby="profile-section-heading"
                    className="space-y-6 border border-hairline p-6"
                >
                    <div className="flex items-center gap-4">
                        <div
                            aria-hidden
                            className="text-heading-md flex size-14 shrink-0 items-center justify-center rounded-full bg-soft-cloud text-ink"
                        >
                            {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                            <h2
                                id="profile-section-heading"
                                className="text-heading-md text-ink"
                            >
                                {t('settings.profile.sectionTitle')}
                            </h2>
                            <p className="text-caption-md truncate text-mute">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <AuthField
                                    id="name"
                                    label={t('settings.profile.name')}
                                    error={errors.name}
                                >
                                    <AuthInput
                                        id="name"
                                        name="name"
                                        required
                                        autoComplete="name"
                                        defaultValue={user.name}
                                        placeholder={t(
                                            'settings.profile.namePlaceholder',
                                        )}
                                        error={errors.name}
                                    />
                                </AuthField>

                                <AuthField
                                    id="email"
                                    label={t('settings.profile.email')}
                                    error={errors.email}
                                >
                                    <AuthInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoComplete="username"
                                        defaultValue={user.email}
                                        placeholder={t(
                                            'settings.profile.emailPlaceholder',
                                        )}
                                        error={errors.email}
                                    />
                                </AuthField>

                                {mustVerifyEmail &&
                                    user.email_verified_at === null && (
                                        <AuthAlert
                                            variant="error"
                                            className="text-caption-md"
                                        >
                                            {t('settings.profile.unverified')}{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="font-medium underline underline-offset-4"
                                            >
                                                {t(
                                                    'settings.profile.resendLink',
                                                )}
                                            </Link>
                                            {status ===
                                                'verification-link-sent' && (
                                                <p className="mt-2 text-success">
                                                    {t('settings.profile.sent')}
                                                </p>
                                            )}
                                        </AuthAlert>
                                    )}

                                <StorefrontButton
                                    type="submit"
                                    variant="primary"
                                    disabled={processing}
                                    className="w-full tablet:w-auto"
                                    data-test="update-profile-button"
                                >
                                    {t('settings.profile.save')}
                                </StorefrontButton>
                            </>
                        )}
                    </Form>
                </section>

                <DeleteAccountSection />
            </div>
        </>
    );
}
