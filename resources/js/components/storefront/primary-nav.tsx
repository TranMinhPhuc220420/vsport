import { Link, router, usePage } from '@inertiajs/react';
import { Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { useCallback, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { CategoryMegaNav } from '@/components/storefront/category-mega-menu';
import { MobileNavDrawer } from '@/components/storefront/mobile-nav-drawer';
import { SearchPill } from '@/components/storefront/SearchPill';
import { useCart } from '@/contexts/cart-context';
import { useWishlist } from '@/contexts/wishlist-context';
import { home } from '@/routes';
import type { Category } from '@/types/catalog';
import type { StoreProfile } from '@/types/store-profile';

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
    const { name: storeName, navigation, storeProfile } = usePage().props as {
        name: string;
        navigation: { categories: Category[] };
        storeProfile: StoreProfile;
    };

    const handleSearchKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
                submitSearch(event.currentTarget.value);
                setSearchOpen(false);
            }
        },
        [],
    );

    return (
        <>
            <CategoryMegaNav
                categories={navigation.categories}
                staticLink={
                    <Link
                        href="/"
                        className="text-body-strong hover:underline"
                    >
                        {t('nav.newFeatured')}
                    </Link>
                }
                leading={
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
                            {storeProfile.logoWideUrl ?? storeProfile.logoUrl ? (
                                <img
                                    src={
                                        storeProfile.logoWideUrl ??
                                        storeProfile.logoUrl ??
                                        undefined
                                    }
                                    alt={storeProfile.name || storeName}
                                    className="h-[55px] w-auto"
                                />
                            ) : (
                                (storeProfile.name ?? storeName)
                            )}
                        </Link>
                    </div>
                }
                trailing={
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
                                        {wishlistCount > 9
                                            ? '9+'
                                            : wishlistCount}
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
                }
                searchOpen={searchOpen}
                onSearchKeyDown={handleSearchKeyDown}
            />

            <MobileNavDrawer
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                categories={navigation.categories}
            />
        </>
    );
}
