import { router, usePage } from '@inertiajs/react';
import { useCallback } from 'react';

import i18n, { syncI18nLocale } from '@/i18n';
import type { AppLocale } from '@/i18n';
import { setCookie } from '@/lib/cookie';
import type { StoreProfile } from '@/types/store-profile';

export type LocaleOption = {
    code: AppLocale;
    label: string;
};

export function useLocale() {
    const { locale, locales, storeProfile } = usePage().props;

    const updateLocale = useCallback(
        (code: AppLocale) => {
            if (code === locale) {
                return;
            }

            setCookie('locale', code);
            syncI18nLocale(code);
            router.reload();
        },
        [locale],
    );

    return {
        locale: locale as AppLocale,
        locales: locales as LocaleOption[],
        currency: (storeProfile as StoreProfile)?.currency || 'USD',
        updateLocale,
        i18n,
    } as const;
}

export function localeToIntl(locale: AppLocale): string {
    return locale === 'vi' ? 'vi-VN' : 'en-US';
}

export function formatCurrency(
    amount: number,
    locale: AppLocale,
    currency = 'USD',
): string {
    if (currency.toUpperCase() === 'VND') {
        const formatted = new Intl.NumberFormat(localeToIntl(locale), {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);

        return `${formatted}đ`;
    }

    return new Intl.NumberFormat(localeToIntl(locale), {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatDateTime(
    value: string | Date,
    locale: AppLocale,
    options?: Intl.DateTimeFormatOptions,
): string {
    return new Intl.DateTimeFormat(localeToIntl(locale), options).format(
        typeof value === 'string' ? new Date(value) : value,
    );
}

export function formatDate(value: string | Date, locale: AppLocale): string {
    return formatDateTime(value, locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
