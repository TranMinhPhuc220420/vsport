import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { StorefrontLanguageSwitcher } from '@/components/storefront/language-switcher';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    categoryHasChildren,
    getCategoryChildren,
} from '@/lib/category-navigation';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { login, register } from '@/routes';
import type { User } from '@/types/auth';
import type { Category } from '@/types/catalog';

type MobileNavDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
};

export function MobileNavDrawer({
    open,
    onOpenChange,
    categories,
}: MobileNavDrawerProps) {
    const { t } = useTranslation('storefront');
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const [expandedParentId, setExpandedParentId] = useState<number | null>(
        null,
    );

    const toggleParent = (parentId: number) => {
        setExpandedParentId((current) =>
            current === parentId ? null : parentId,
        );
    };

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
                    className="flex flex-col gap-1 overflow-y-auto px-6 py-6"
                    aria-label={t('mobileMenu.aria')}
                >
                    <Link
                        href="/"
                        className="text-body-strong py-3 text-ink"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('nav.newFeatured')}
                    </Link>
                    <Link
                        href="/blog"
                        className="text-body-strong py-3 text-ink"
                        onClick={() => onOpenChange(false)}
                    >
                        {t('footer.news')}
                    </Link>

                    {categories.map((category) => {
                        const children = getCategoryChildren(category);
                        const hasChildren = categoryHasChildren(category);
                        const isExpanded = expandedParentId === category.id;

                        if (!hasChildren) {
                            return (
                                <Link
                                    key={category.id}
                                    href={`/${category.slug}`}
                                    className="text-body-strong py-3 text-ink"
                                    onClick={() => onOpenChange(false)}
                                >
                                    {category.name}
                                </Link>
                            );
                        }

                        return (
                            <div
                                key={category.id}
                                className="border-b border-hairline-soft pb-2"
                            >
                                <button
                                    type="button"
                                    className="text-body-strong flex w-full items-center justify-between py-3 text-left text-ink"
                                    aria-expanded={isExpanded}
                                    onClick={() => toggleParent(category.id)}
                                >
                                    <span>{category.name}</span>
                                    <ChevronDown
                                        className={cn(
                                            'size-4 transition-transform',
                                            isExpanded && 'rotate-180',
                                        )}
                                    />
                                </button>

                                {isExpanded && (
                                    <div className="flex flex-col gap-1 pb-2 pl-3">
                                        <Link
                                            href={`/${category.slug}`}
                                            className="text-body-md py-2 text-ink"
                                            onClick={() => onOpenChange(false)}
                                        >
                                            {t('nav.shopAll', {
                                                name: category.name,
                                            })}
                                        </Link>
                                        {children.map((child) => (
                                            <Link
                                                key={child.id}
                                                href={`/${child.slug}`}
                                                className="text-body-md flex items-center gap-3 py-2 text-mute"
                                                onClick={() =>
                                                    onOpenChange(false)
                                                }
                                            >
                                                {child.imageUrl && (
                                                    <img
                                                        src={child.imageUrl}
                                                        alt=""
                                                        className="size-10 shrink-0 object-cover"
                                                    />
                                                )}
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-hairline px-6 py-6">
                    <div className="mb-4">
                        <StorefrontLanguageSwitcher variant="drawer" />
                    </div>
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
