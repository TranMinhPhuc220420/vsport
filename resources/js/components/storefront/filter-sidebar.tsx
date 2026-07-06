import { Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { FilterChip } from '@/components/storefront/FilterChip';
import { plpUrl } from '@/lib/plp-navigation';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/catalog';

type FilterSidebarProps = {
    categorySlug: string;
    activeDepartment: string;
    sort: string;
    departments: Category[];
    subCategories: Category[];
    visible: boolean;
    onToggle: () => void;
    className?: string;
};

function FilterSidebar({
    categorySlug,
    activeDepartment,
    sort,
    departments,
    subCategories,
    className,
}: FilterSidebarProps) {
    const { t } = useTranslation(['storefront', 'common']);

    const navigate = (slug: string) => {
        router.get(
            plpUrl(slug, sort),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <aside
            data-slot="filter-sidebar"
            className={cn(
                'hidden shrink-0 tablet-lg:block tablet-lg:w-[220px]',
                className,
            )}
        >
            <div className="space-y-6 py-4">
                <div>
                    <h3 className="text-caption-md mb-3 text-mute">
                        {t('storefront:plp.gender')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {departments.map((department) => (
                            <FilterChip
                                key={department.id}
                                active={activeDepartment === department.slug}
                                onClick={() => navigate(department.slug)}
                            >
                                {department.name}
                            </FilterChip>
                        ))}
                    </div>
                </div>

                {subCategories.length > 0 && (
                    <div>
                        <h3 className="text-caption-md mb-3 text-mute">
                            {t('storefront:plp.category')}
                        </h3>
                        <ul className="space-y-2">
                            {subCategories.map((child) => (
                                <li key={child.id}>
                                    <Link
                                        href={plpUrl(child.slug, sort)}
                                        className={cn(
                                            'text-body-strong hover:underline',
                                            categorySlug === child.slug
                                                ? 'text-ink underline'
                                                : 'text-ink',
                                        )}
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
