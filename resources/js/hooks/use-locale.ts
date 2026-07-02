import { router, usePage } from '@inertiajs/react';
import { useCallback } from 'react';

import i18n, { syncI18nLocale } from '@/i18n';
import type { AppLocale } from '@/i18n';
import { setCookie } from '@/lib/cookie';

export type LocaleOption = {
    code: AppLocale;
    label: string;
};

export function useLocale() {
    const { locale, locales } = usePage().props;

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
