import { Link, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { dashboard } from '@/routes';
import { login, register } from '@/routes';
import type { User } from '@/types/auth';

type NavItem = {
    label: string;
    href: string;
};

type MobileNavDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: NavItem[];
};

export function MobileNavDrawer({
    open,
    onOpenChange,
    items,
}: MobileNavDrawerProps) {
    const { t } = useTranslation('storefront');
    const { auth } = usePage<{ auth: { user: User | null } }>().props;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="left"
                className="vsport-light flex h-full w-[min(100%,20rem)] flex-col border-r border-hairline bg-canvas p-0"
            >
                <SheetHeader className="border-b border-hairline px-6 py-4">
                    <SheetTitle className="text-heading-lg text-ink">
                        {t('mobileMenu.title')}
                    </SheetTitle>
                </SheetHeader>
                <nav
                    className="flex flex-col gap-1 px-6 py-6"
                    aria-label={t('mobileMenu.aria')}
                >
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-body-strong py-3 text-ink"
                            onClick={() => onOpenChange(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto border-t border-hairline px-6 py-6">
                    {auth.user ? (
                        <div className="flex flex-col gap-3">
                            <Link
                                href="/orders"
                                className="text-body-strong text-ink"
                                onClick={() => onOpenChange(false)}
                            >
                                {t('nav.orders')}
                            </Link>
                            <Link
                                href={dashboard()}
                                className="text-body-strong text-ink"
                                onClick={() => onOpenChange(false)}
                            >
                                {t('nav.account')}
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <StorefrontButton variant="primary" asChild>
                                <Link
                                    href={login()}
                                    onClick={() => onOpenChange(false)}
                                >
                                    {t('nav.signIn')}
                                </Link>
                            </StorefrontButton>
                            <StorefrontButton variant="secondary" asChild>
                                <Link
                                    href={register()}
                                    onClick={() => onOpenChange(false)}
                                >
                                    {t('nav.joinUs')}
                                </Link>
                            </StorefrontButton>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
