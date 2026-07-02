import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAdmin from '@/locales/en/admin.json';
import enAuth from '@/locales/en/auth.json';
import enCommon from '@/locales/en/common.json';
import enSettings from '@/locales/en/settings.json';
import enStorefront from '@/locales/en/storefront.json';
import viAdmin from '@/locales/vi/admin.json';
import viAuth from '@/locales/vi/auth.json';
import viCommon from '@/locales/vi/common.json';
import viSettings from '@/locales/vi/settings.json';
import viStorefront from '@/locales/vi/storefront.json';

export type AppLocale = 'vi' | 'en';

export const defaultLocale: AppLocale = 'vi';
export const fallbackLocale: AppLocale = 'en';

void i18n.use(initReactI18next).init({
    resources: {
        en: {
            common: enCommon,
            storefront: enStorefront,
            admin: enAdmin,
            auth: enAuth,
            settings: enSettings,
        },
        vi: {
            common: viCommon,
            storefront: viStorefront,
            admin: viAdmin,
            auth: viAuth,
            settings: viSettings,
        },
    },
    lng: defaultLocale,
    fallbackLng: fallbackLocale,
    defaultNS: 'common',
    ns: ['common', 'storefront', 'admin', 'auth', 'settings'],
    interpolation: {
        escapeValue: false,
    },
});

export function syncI18nLocale(locale: AppLocale): void {
    if (i18n.language !== locale) {
        void i18n.changeLanguage(locale);
    }
}

export default i18n;
