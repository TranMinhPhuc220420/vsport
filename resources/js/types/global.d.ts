import type { Auth } from '@/types/auth';
import type { StoreProfile } from '@/types/store-profile';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            locale: 'vi' | 'en';
            locales: { code: 'vi' | 'en'; label: string }[];
            navigation: {
                categories: import('@/types/catalog').Category[];
            };
            storeProfile: StoreProfile;
            [key: string]: unknown;
        };
    }
}
