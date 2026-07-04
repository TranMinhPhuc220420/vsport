import type { CSSProperties, ReactNode } from 'react';

import { BackToTop } from '@/components/storefront/back-to-top';
import { StorefrontFooter } from '@/components/storefront/footer';
import { PrimaryNav } from '@/components/storefront/primary-nav';
import { UtilityBar } from '@/components/storefront/utility-bar';
import { CartProvider } from '@/contexts/cart-context';
import { WishlistProvider } from '@/contexts/wishlist-context';

const storefrontSafeAreaStyle = {
    '--storefront-safe-bottom': 'env(safe-area-inset-bottom, 0px)',
    '--storefront-safe-top': 'env(safe-area-inset-top, 0px)',
} as CSSProperties;

export default function StorefrontLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <CartProvider>
            <WishlistProvider>
                <div
                    className="vsport-light flex min-h-dvh flex-col overflow-x-clip bg-canvas text-ink"
                    style={storefrontSafeAreaStyle}
                >
                    <header className="sticky top-0 z-40 overflow-visible bg-canvas pt-[var(--storefront-safe-top)]">
                        <div className="hidden tablet-lg:block">
                            <UtilityBar />
                        </div>
                        <PrimaryNav />
                    </header>
                    <main className="min-w-0 flex-1">{children}</main>
                    <StorefrontFooter />
                    <BackToTop />
                </div>
            </WishlistProvider>
        </CartProvider>
    );
}
