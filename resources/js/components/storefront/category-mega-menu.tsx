import { Link, router } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { SearchPill } from '@/components/storefront/SearchPill';
import {
    categoryHasChildren,
    getCategoryChildren,
} from '@/lib/category-navigation';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/catalog';

const PANEL_CLOSE_DELAY_MS = 150;

type PreviewImage = {
    url: string | null;
    alt: string;
    isOwnImage: boolean;
};

function resolvePreviewImage(
    preview: Category,
    parent: Category,
): PreviewImage {
    const ownImage = preview.imageUrl ?? null;

    return {
        url: ownImage ?? parent.imageUrl ?? null,
        alt: preview.imageAlt ?? preview.name,
        isOwnImage: ownImage !== null,
    };
}

type CategoryPreviewProps = {
    previewCategory: Category;
    previewImage: PreviewImage;
    viewCategoryLabel: string;
    onNavigate: () => void;
};

function CategoryPreview({
    previewCategory,
    previewImage,
    viewCategoryLabel,
    onNavigate,
}: CategoryPreviewProps) {
    const imageAnimationClass = previewImage.isOwnImage
        ? 'mega-menu-preview-own-in'
        : 'mega-menu-preview-in';

    if (!previewImage.url) {
        return (
            <Link
                href={`/${previewCategory.slug}`}
                className="flex aspect-[4/5] w-full items-end bg-soft-cloud p-4"
                onClick={onNavigate}
            >
                <span
                    key={previewCategory.id}
                    className="mega-menu-label-in text-heading-md text-ink"
                >
                    {previewCategory.name}
                </span>
            </Link>
        );
    }

    return (
        <Link
            href={`/${previewCategory.slug}`}
            className="group relative block aspect-[4/5] w-full overflow-hidden bg-soft-cloud"
            aria-label={viewCategoryLabel}
            onClick={onNavigate}
        >
            <img
                key={`${previewCategory.id}-${previewImage.url}`}
                src={previewImage.url}
                alt={previewImage.alt}
                className={cn(
                    'motion-safe-hover-scale size-full object-cover',
                    imageAnimationClass,
                )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/30 to-transparent" />
            <p
                key={`label-${previewCategory.id}`}
                className="mega-menu-label-in text-body-strong absolute bottom-3 left-3 text-canvas"
            >
                {previewCategory.name}
            </p>
        </Link>
    );
}

type CategoryMegaNavProps = {
    categories: Category[];
    staticLink: ReactNode;
    leading: ReactNode;
    trailing: ReactNode;
    searchOpen?: boolean;
    onSearchKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export function CategoryMegaNav({
    categories,
    staticLink,
    leading,
    trailing,
    searchOpen = false,
    onSearchKeyDown,
}: CategoryMegaNavProps) {
    const { t } = useTranslation('storefront');
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [activeParentId, setActiveParentId] = useState<number | null>(null);
    const [previewCategoryId, setPreviewCategoryId] = useState<number | null>(
        null,
    );

    const activeParent = useMemo(
        () => categories.find((category) => category.id === activeParentId),
        [categories, activeParentId],
    );

    const activeChildren = useMemo(
        () => (activeParent ? getCategoryChildren(activeParent) : []),
        [activeParent],
    );

    const previewCategory = useMemo(() => {
        if (!activeParent) {
            return null;
        }

        if (previewCategoryId === null) {
            return activeParent;
        }

        if (previewCategoryId === activeParent.id) {
            return activeParent;
        }

        return (
            activeChildren.find((child) => child.id === previewCategoryId) ??
            activeParent
        );
    }, [activeParent, activeChildren, previewCategoryId]);

    const previewImage = useMemo(() => {
        if (!activeParent || !previewCategory) {
            return null;
        }

        return resolvePreviewImage(previewCategory, activeParent);
    }, [activeParent, previewCategory]);

    const clearCloseTimer = useCallback(() => {
        if (closeTimerRef.current !== null) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
    }, []);

    const openPanel = useCallback(
        (parent: Category) => {
            clearCloseTimer();
            setActiveParentId(parent.id);
            setPreviewCategoryId(parent.id);
        },
        [clearCloseTimer],
    );

    const closePanel = useCallback(() => {
        setActiveParentId(null);
        setPreviewCategoryId(null);
    }, []);

    const handleNavItemEnter = useCallback(
        (category: Category) => {
            if (categoryHasChildren(category)) {
                openPanel(category);

                return;
            }

            closePanel();
        },
        [openPanel, closePanel],
    );

    const scheduleClosePanel = useCallback(() => {
        clearCloseTimer();
        closeTimerRef.current = setTimeout(() => {
            closePanel();
        }, PANEL_CLOSE_DELAY_MS);
    }, [clearCloseTimer, closePanel]);

    useEffect(() => {
        return () => clearCloseTimer();
    }, [clearCloseTimer]);

    useEffect(() => {
        const handleEscape = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                closePanel();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => document.removeEventListener('keydown', handleEscape);
    }, [closePanel]);

    useEffect(() => {
        const removeStart = router.on('start', closePanel);

        return () => removeStart();
    }, [closePanel]);

    return (
        <header
            className="vsport-light relative overflow-visible border-b border-hairline-soft bg-canvas text-ink"
            onMouseLeave={scheduleClosePanel}
        >
            <div className="storefront-container flex h-14 items-center gap-4">
                {leading}

                <div
                    className="wrap-categories relative hidden flex-1 justify-center tablet-lg:flex"
                    onMouseEnter={clearCloseTimer}
                >
                    <nav
                        className="flex items-center gap-6"
                        aria-label={t('nav.primary')}
                    >
                        <div onMouseEnter={closePanel}>{staticLink}</div>

                        {categories.map((category) => {
                            const hasChildren = categoryHasChildren(category);
                            const isOpen = activeParentId === category.id;

                            if (!hasChildren) {
                                return (
                                    <Link
                                        key={category.id}
                                        href={`/${category.slug}`}
                                        className="text-body-strong hover:underline"
                                        onMouseEnter={() => closePanel()}
                                    >
                                        {category.name}
                                    </Link>
                                );
                            }

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={cn(
                                        'text-body-strong hover:underline',
                                        isOpen && 'underline',
                                    )}
                                    aria-expanded={isOpen}
                                    aria-haspopup="true"
                                    onMouseEnter={() =>
                                        handleNavItemEnter(category)
                                    }
                                    onFocus={() => openPanel(category)}
                                >
                                    {category.name}
                                </button>
                            );
                        })}
                    </nav>

                    {activeParent && previewCategory && previewImage && (
                        <div
                            className="absolute top-full right-0 left-0 z-50 mt-2 w-full"
                            onMouseEnter={clearCloseTimer}
                        >
                            <div
                                key={activeParent.id}
                                className="animate-in duration-200 ease-out fade-in-0 slide-in-from-top-2"
                            >
                                <div className="flex items-stretch justify-between gap-8 border border-hairline-soft bg-canvas p-6 shadow-md desktop:gap-12 desktop:p-8">
                                    <nav
                                        className="min-w-[10rem] shrink-0 desktop:min-w-[12rem]"
                                        aria-label={activeParent.name}
                                    >
                                        <ul
                                            className="flex flex-col gap-2.5"
                                            role="list"
                                        >
                                            <li>
                                                <Link
                                                    href={`/${activeParent.slug}`}
                                                    className="text-body-strong hover:underline"
                                                    onClick={closePanel}
                                                    onMouseEnter={() =>
                                                        setPreviewCategoryId(
                                                            activeParent.id,
                                                        )
                                                    }
                                                >
                                                    {t('nav.shopAll', {
                                                        name: activeParent.name,
                                                    })}
                                                </Link>
                                            </li>
                                            {activeChildren.map((child) => (
                                                <li key={child.id}>
                                                    <Link
                                                        href={`/${child.slug}`}
                                                        className={cn(
                                                            'text-body-md text-mute hover:text-ink hover:underline',
                                                            previewCategoryId ===
                                                                child.id &&
                                                                'text-ink underline',
                                                        )}
                                                        onClick={closePanel}
                                                        onMouseEnter={() =>
                                                            setPreviewCategoryId(
                                                                child.id,
                                                            )
                                                        }
                                                    >
                                                        {child.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>

                                    <div className="w-44 shrink-0 self-stretch desktop:w-56">
                                        <CategoryPreview
                                            previewCategory={previewCategory}
                                            previewImage={previewImage}
                                            viewCategoryLabel={t(
                                                'nav.viewCategory',
                                                {
                                                    name: previewCategory.name,
                                                },
                                            )}
                                            onNavigate={closePanel}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {trailing}
            </div>

            {searchOpen && onSearchKeyDown && (
                <div className="border-t border-hairline-soft px-4 py-3 desktop:hidden">
                    <SearchPill
                        placeholder={t('nav.search')}
                        autoFocus
                        onKeyDown={onSearchKeyDown}
                    />
                </div>
            )}
        </header>
    );
}
