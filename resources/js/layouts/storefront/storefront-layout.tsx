import type { ReactNode } from 'react';

import { BackToTop } from '@/components/storefront/back-to-top';
import { StorefrontFooter } from '@/components/storefront/footer';
import { PrimaryNav } from '@/components/storefront/primary-nav';
import { UtilityBar } from '@/components/storefront/utility-bar';
import { CartProvider } from '@/contexts/cart-context';
import { WishlistProvider } from '@/contexts/wishlist-context';

export default function StorefrontLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <CartProvider>
            <WishlistProvider>
                <div className="vsport-light flex min-h-screen flex-col bg-canvas text-ink">
                    <UtilityBar />
                    <PrimaryNav />
                    <main className="flex-1">{children}</main>
                    <StorefrontFooter />
                    <BackToTop />
                </div>
            </WishlistProvider>
        </CartProvider>
    );
}
