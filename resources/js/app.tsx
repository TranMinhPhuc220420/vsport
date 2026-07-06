import { createInertiaApp } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import i18n, { syncI18nLocale } from '@/i18n';
import type { AppLocale } from '@/i18n';
import AdminLayout from '@/layouts/admin/admin-layout';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import StorefrontLayout from '@/layouts/storefront/storefront-layout';
import StorefrontSettingsLayout from '@/layouts/storefront/storefront-settings-layout';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'welcome':
                return null;
            case name === 'error':
                return StorefrontLayout;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            case name.startsWith('admin/'):
                return AdminLayout;
            case name.startsWith('storefront/settings/'):
                return [StorefrontLayout, StorefrontSettingsLayout];
            case name.startsWith('preview/'):
            case name.startsWith('storefront/'):
                return StorefrontLayout;
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app: ReactElement, { page }) {
        syncI18nLocale(page.props.locale as AppLocale);

        return (
            <I18nextProvider i18n={i18n}>
                <TooltipProvider delayDuration={0}>
                    {app}
                    <Toaster />
                </TooltipProvider>
            </I18nextProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
