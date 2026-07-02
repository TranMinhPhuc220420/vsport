import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

import { StorefrontButton } from '@/components/storefront/Button';
import { cn } from '@/lib/utils';

const categoryImages: Record<string, string> = {
    men: 'https://placehold.co/600x750/111111/ffffff?text=Men',
    women: 'https://placehold.co/600x750/39393b/ffffff?text=Women',
    kids: 'https://placehold.co/600x750/007d48/ffffff?text=Kids',
    jordan: 'https://placehold.co/600x750/d30005/ffffff?text=Jordan',
};

type CategoryTileProps = {
    name: string;
    slug: string;
    imageUrl?: string;
    className?: string;
};

function CategoryTile({ name, slug, imageUrl, className }: CategoryTileProps) {
    const { t } = useTranslation('storefront');
    const src = imageUrl ?? categoryImages[slug] ?? categoryImages.men;

    return (
        <article
            data-slot="category-tile"
            className={cn(
                'group relative aspect-[4/5] overflow-hidden',
                className,
            )}
        >
            <img
                src={src}
                alt={name}
                loading="lazy"
                className="motion-safe-hover-scale size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
            <div className="absolute bottom-4 left-4">
                <StorefrontButton variant="outline-on-image" asChild>
                    <Link href={`/${slug}`}>
                        {t('pdp.shopCategory', { name })}
                    </Link>
                </StorefrontButton>
            </div>
        </article>
    );
}

export { CategoryTile };
