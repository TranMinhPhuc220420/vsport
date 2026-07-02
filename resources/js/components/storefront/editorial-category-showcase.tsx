import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';

import { CategoryTile } from '@/components/storefront/category-tile';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/catalog';

type EditorialCategoryShowcaseProps = {
    categories: Category[];
    className?: string;
};

function EditorialCategoryShowcase({
    categories,
    className,
}: EditorialCategoryShowcaseProps) {
    const { t } = useTranslation('storefront');

    if (categories.length === 0) {
        return null;
    }

    const [featured, ...rest] = categories;

    return (
        <section
            data-slot="editorial-category-showcase"
            className={cn('storefront-container storefront-section', className)}
        >
            <ScrollReveal direction="left">
                <h2 className="text-heading-xl text-ink">
                    {t('home.shopByCategory')}
                </h2>
            </ScrollReveal>

            <ScrollReveal staggerChildren className="mt-6">
                <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2 desktop:grid-cols-4 desktop:grid-rows-2">
                    <div
                        className="desktop:col-span-2 desktop:row-span-2"
                        style={{ '--stagger-index': 0 } as CSSProperties}
                    >
                        <CategoryTile
                            name={featured.name}
                            slug={featured.slug}
                            className="h-full min-h-[20rem] desktop:min-h-[32rem]"
                        />
                    </div>

                    {rest.map((category, index) => (
                        <div
                            key={category.id}
                            style={
                                {
                                    '--stagger-index': index + 1,
                                } as CSSProperties
                            }
                        >
                            <CategoryTile
                                name={category.name}
                                slug={category.slug}
                            />
                        </div>
                    ))}
                </div>
            </ScrollReveal>
        </section>
    );
}

export { EditorialCategoryShowcase };
