import { Form, Head, setLayoutProps } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    AuthField,
    AuthInput,
    StorefrontButton,
} from '@/components/storefront';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { cn } from '@/lib/utils';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const { t } = useTranslation('auth');
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: t('twoFactor.recoveryTitle'),
                description: t('twoFactor.recoveryDescription'),
                toggleText: t('twoFactor.useOtp'),
            };
        }

        return {
            title: t('twoFactor.otpTitle'),
            description: t('twoFactor.otpDescription'),
            toggleText: t('twoFactor.useRecovery'),
        };
    }, [showRecoveryInput, t]);

    setLayoutProps({
        title: authConfigContent.title,
        description: authConfigContent.description,
        editorialHeadline: t('twoFactor.editorialHeadline'),
    });

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title={t('twoFactor.title')} />

            <div className="space-y-6">
                <Form
                    {...store.form()}
                    className="space-y-5"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <AuthField
                                    id="recovery_code"
                                    label={t('twoFactor.recoveryTitle')}
                                    error={errors.recovery_code}
                                >
                                    <AuthInput
                                        id="recovery_code"
                                        name="recovery_code"
                                        type="text"
                                        placeholder={t(
                                            'twoFactor.recoveryPlaceholder',
                                        )}
                                        autoFocus={showRecoveryInput}
                                        required
                                        error={errors.recovery_code}
                                    />
                                </AuthField>
                            ) : (
                                <div className="flex flex-col items-center space-y-3">
                                    <InputOTP
                                        name="code"
                                        maxLength={OTP_MAX_LENGTH}
                                        value={code}
                                        onChange={(value) => setCode(value)}
                                        disabled={processing}
                                        pattern={REGEXP_ONLY_DIGITS}
                                        autoFocus
                                    >
                                        <InputOTPGroup className="gap-2">
                                            {Array.from(
                                                { length: OTP_MAX_LENGTH },
                                                (_, index) => (
                                                    <InputOTPSlot
                                                        key={index}
                                                        index={index}
                                                        className={cn(
                                                            'size-12 rounded-pill-md border-hairline text-body-strong',
                                                            errors.code &&
                                                                'border-sale',
                                                        )}
                                                    />
                                                ),
                                            )}
                                        </InputOTPGroup>
                                    </InputOTP>
                                    {errors.code && (
                                        <p
                                            role="alert"
                                            className="text-caption-sm text-sale"
                                        >
                                            {errors.code}
                                        </p>
                                    )}
                                </div>
                            )}

                            <StorefrontButton
                                type="submit"
                                variant="primary"
                                className="w-full"
                                disabled={processing}
                            >
                                {processing && (
                                    <LoaderCircle className="size-4 animate-spin" />
                                )}
                                {t('twoFactor.continue')}
                            </StorefrontButton>

                            <p className="text-center text-caption-md text-mute">
                                {t('twoFactor.orYouCan')}{' '}
                                <button
                                    type="button"
                                    className="text-ink underline decoration-hairline underline-offset-4 transition-colors hover:decoration-ink"
                                    onClick={() =>
                                        toggleRecoveryMode(clearErrors)
                                    }
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </p>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
