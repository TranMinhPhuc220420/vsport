import { Link, router } from '@inertiajs/react';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { SortSheet } from '@/components/storefront/sort-sheet';
import { plpUrl } from '@/lib/plp-navigation';
import { cn } from '@/lib/utils';
import type { CategoryMeta, ListingFilters } from '@/types/catalog';

type PlpSubNavProps = {
    categoryMeta: CategoryMeta;
    filters: ListingFilters;
    filtersVisible: boolean;
    onToggleFilters: () => void;
    className?: string;
};

function PlpSubNav({
    categoryMeta,
    filters,
    filtersVisible,
    onToggleFilters,
    className,
}: PlpSubNavProps) {
    const { t } = useTranslation('storefront');
    const [sortSheetOpen, setSortSheetOpen] = useState(false);

    const sortOptions = [
        { value: 'newest', label: t('plp.sortNewest') },
        { value: 'price_asc', label: t('plp.sortPriceLow') },
        { value: 'price_desc', label: t('plp.sortPriceHigh') },
    ];

    const handleSortChange = (sort: string) => {
        router.get(
            plpUrl(categoryMeta.slug, sort),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const currentSortLabel =
        sortOptions.find((o) => o.value === filters.sort)?.label ??
        sortOptions[0].label;

    return (
        <>
            <SortSheet
                open={sortSheetOpen}
                onOpenChange={setSortSheetOpen}
                options={sortOptions}
                value={filters.sort}
                onChange={handleSortChange}
            />

            <div
                data-slot="plp-sub-nav"
                className={cn(
                    'sticky top-0 z-30 border-b border-hairline-soft bg-canvas shadow-[inset_0_-1px_0_var(--color-hairline-soft)] transition-shadow duration-200',
                    className,
                )}
            >
                <div className="storefront-container flex flex-wrap items-center justify-between gap-4 py-4">
                    <nav
                        aria-label={t('plp.breadcrumb')}
                        className="flex items-center gap-2"
                    >
                        <Link
                            href="/"
                            className="text-caption-md text-mute hover:underline"
                        >
                            {t('plp.home')}
                        </Link>
                        {categoryMeta.breadcrumb.map((item) => (
                            <span
                                key={item.slug}
                                className="flex items-center gap-2"
                            >
                                <span className="text-caption-md text-mute">
                                    /
                                </span>
                                <Link
                                    href={plpUrl(item.slug, filters.sort)}
                                    className="text-caption-md text-ink hover:underline"
                                >
                                    {item.name}
                                </Link>
                            </span>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <div className="relative tablet-lg:hidden">
                            <StorefrontButton
                                variant="icon"
                                aria-label={
                                    filtersVisible
                                        ? t('plp.hideFilters')
                                        : t('plp.showFilters')
                                }
                                onClick={onToggleFilters}
                            >
                                <SlidersHorizontal className="size-5" />
                            </StorefrontButton>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSortSheetOpen(true)}
                            className="text-caption-md flex items-center gap-1 tablet-lg:hidden"
                        >
                            <span className="text-mute">
                                {t('plp.sortTitle')}:
                            </span>
                            <span className="text-ink">{currentSortLabel}</span>
                        </button>

                        <label className="hidden items-center gap-2 tablet-lg:flex">
                            <span className="text-caption-md text-mute">
                                {t('plp.sortBy')}
                            </span>
                            <select
                                value={filters.sort}
                                onChange={(e) =>
                                    handleSortChange(e.target.value)
                                }
                                className="text-button-md h-10 rounded-pill-md border border-hairline bg-canvas px-3"
                            >
                                {sortOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
            </div>
        </>
    );
}

export { PlpSubNav };
