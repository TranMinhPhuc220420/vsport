import { Link, router } from '@inertiajs/react';
import { Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { useCallback, useMemo, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { MobileNavDrawer } from '@/components/storefront/mobile-nav-drawer';
import { SearchPill } from '@/components/storefront/SearchPill';
import { StorefrontButton } from '@/components/storefront/Button';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { home } from '@/routes';

function submitSearch(value: string): void {
    const query = value.trim();

    if (query === '') {
        return;
    }

    router.get('/search', { q: query });
}

export function PrimaryNav() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const { itemCount } = useCart();
    const { itemCount: wishlistCount } = useWishlist();
    const { t } = useTranslation('storefront');

    const handleSearchKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                submitSearch(event.currentTarget.value);
                setSearchOpen(false);
            }
        },
        [],
    );

    const navItems = useMemo(
        () => [
            { label: t('nav.newFeatured'), href: '/' },
            { label: t('nav.men'), href: '/men' },
            { label: t('nav.women'), href: '/women' },
            { label: t('nav.kids'), href: '/kids' },
            { label: t('nav.jordan'), href: '/jordan' },
        ],
        [t],
    );

    return (
        <>
            <header className="vsport-light sticky top-0 z-40 border-b border-hairline-soft bg-canvas text-ink">
                <div className="storefront-container flex h-14 items-center gap-4">
                    <div className="flex items-center gap-3 tablet-lg:gap-6">
                        <StorefrontButton
                            variant="icon"
                            className="tablet-lg:hidden"
                            aria-label={t('nav.openMenu')}
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="size-5" />
                        </StorefrontButton>

                        <Link
                            href={home()}
                            className="text-heading-lg font-medium tracking-tight"
                        >
                            VSport
                        </Link>
                    </div>

                    <nav
                        className="hidden flex-1 items-center justify-center gap-6 tablet-lg:flex"
                        aria-label={t('nav.primary')}
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-body-strong hover:underline"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        <div className="hidden w-56 desktop:block">
                            <SearchPill
                                placeholder={t('nav.search')}
                                onKeyDown={handleSearchKeyDown}
                            />
                        </div>

                        <StorefrontButton
                            variant="icon"
                            className="desktop:hidden"
                            aria-label={t('nav.search')}
                            onClick={() => setSearchOpen((open) => !open)}
                        >
                            <Search className="size-5" />
                        </StorefrontButton>

                        <StorefrontButton
                            variant="icon"
                            aria-label={t('nav.wishlist')}
                            className="relative"
                            asChild
                        >
                            <Link href="/wishlist">
                                <Heart className="size-5" />
                                {wishlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-canvas">
                                        {wishlistCount > 9 ? '9+' : wishlistCount}
                                    </span>
                                )}
                            </Link>
                        </StorefrontButton>

                        <StorefrontButton
                            variant="icon"
                            aria-label={t('nav.bag')}
                            className="relative"
                            asChild
                        >
                            <Link href="/cart">
                                <ShoppingBag className="size-5" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-canvas">
                                        {itemCount > 9 ? '9+' : itemCount}
                                    </span>
                                )}
                            </Link>
                        </StorefrontButton>
                    </div>
                </div>

                {searchOpen && (
                    <div className="border-t border-hairline-soft px-4 py-3 desktop:hidden">
                        <SearchPill
                            placeholder={t('nav.search')}
                            autoFocus
                            onKeyDown={handleSearchKeyDown}
                        />
                    </div>
                )}
            </header>

            <MobileNavDrawer
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                items={navItems}
            />
        </>
    );
}
