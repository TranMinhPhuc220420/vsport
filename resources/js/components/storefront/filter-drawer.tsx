import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { FilterChip } from '@/components/storefront/FilterChip';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { plpUrl } from '@/lib/plp-navigation';
import type { Category } from '@/types/catalog';

type FilterDrawerProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categorySlug: string;
    activeDepartment: string;
    sort: string;
    departments: Category[];
    subCategories: Category[];
};

function FilterDrawer({
    open,
    onOpenChange,
    categorySlug,
    activeDepartment,
    sort,
    departments,
    subCategories,
}: FilterDrawerProps) {
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
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="vsport-light max-h-[85dvh] rounded-t-2xl border-t border-hairline bg-canvas px-0"
            >
                <SheetHeader className="border-b border-hairline-soft px-6 py-4">
                    <SheetTitle className="text-body-strong text-ink">
                        {t('storefront:plp.filters')}
                    </SheetTitle>
                </SheetHeader>

                <div className="overflow-y-auto px-6 py-4">
                    <div className="space-y-6">
                        {departments.length > 0 && (
                            <div>
                                <h3 className="text-caption-md mb-3 text-mute">
                                    {t('storefront:plp.gender')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {departments.map((department) => (
                                        <FilterChip
                                            key={department.id}
                                            active={
                                                activeDepartment ===
                                                department.slug
                                            }
                                            onClick={() =>
                                                navigate(department.slug)
                                            }
                                        >
                                            {department.name}
                                        </FilterChip>
                                    ))}
                                </div>
                            </div>
                        )}

                        {subCategories.length > 0 && (
                            <div>
                                <h3 className="text-caption-md mb-3 text-mute">
                                    {t('storefront:plp.category')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {subCategories.map((child) => (
                                        <FilterChip
                                            key={child.id}
                                            active={categorySlug === child.slug}
                                            onClick={() => navigate(child.slug)}
                                        >
                                            {child.name}
                                        </FilterChip>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

export { FilterDrawer };
