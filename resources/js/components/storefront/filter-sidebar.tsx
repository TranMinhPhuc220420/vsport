import { Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { FilterChip } from '@/components/storefront/FilterChip';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/catalog';

type FilterSidebarProps = {
    categorySlug: string;
    activeGender: string | null;
    genders: string[];
    childCategories: Category[];
    visible: boolean;
    onToggle: () => void;
    className?: string;
};

function FilterSidebar({
    categorySlug,
    activeGender,
    genders,
    childCategories,
    visible,
    onToggle,
    className,
}: FilterSidebarProps) {
    const { t } = useTranslation(['storefront', 'common']);

    const applyGender = (gender: string | null) => {
        router.get(
            `/${categorySlug}`,
            { gender: gender ?? undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <aside
            data-slot="filter-sidebar"
            className={cn(
                'w-full shrink-0 tablet-lg:w-[220px]',
                !visible && 'hidden tablet-lg:block',
                visible && 'block',
                className,
            )}
        >
            <div className="flex items-center justify-between border-b border-hairline pb-4 tablet-lg:hidden">
                <h2 className="text-body-strong text-ink">
                    {t('storefront:plp.filters')}
                </h2>
                <button
                    type="button"
                    onClick={onToggle}
                    className="text-caption-md text-ink underline"
                >
                    {t('storefront:plp.hideFiltersAction')}
                </button>
            </div>

            <div className="space-y-6 py-4">
                <div>
                    <h3 className="mb-3 text-caption-md text-mute">
                        {t('storefront:plp.gender')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <FilterChip
                            active={activeGender === null}
                            onClick={() => applyGender(null)}
                        >
                            {t('common:all')}
                        </FilterChip>
                        {genders.map((gender) => (
                            <FilterChip
                                key={gender}
                                active={activeGender === gender}
                                onClick={() => applyGender(gender)}
                            >
                                {gender}
                            </FilterChip>
                        ))}
                    </div>
                </div>

                {childCategories.length > 0 && (
                    <div>
                        <h3 className="mb-3 text-caption-md text-mute">
                            {t('storefront:plp.category')}
                        </h3>
                        <ul className="space-y-2">
                            {childCategories.map((child) => (
                                <li key={child.id}>
                                    <Link
                                        href={`/${child.slug}`}
                                        className="text-body-strong text-ink hover:underline"
                                    >
                                        {child.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </aside>
    );
}

export { FilterSidebar };
