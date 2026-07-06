import { Link } from '@inertiajs/react';

import { cn } from '@/lib/utils';

type CategoryTileProps = {
    name: string;
    slug: string;
    imageUrl?: string | null;
    imageAlt?: string | null;
    featured?: boolean;
    className?: string;
};

function CategoryTile({
    name,
    slug,
    imageUrl,
    imageAlt,
    featured = false,
    className,
}: CategoryTileProps) {
    return (
        <Link
            href={`/${slug}`}
            data-slot="category-tile"
            className={cn(
                'group relative block aspect-[4/5] overflow-hidden bg-soft-cloud',
                className,
            )}
        >
            {imageUrl ? (
                <>
                    <img
                        src={imageUrl}
                        alt={imageAlt ?? name}
                        loading="lazy"
                        className="motion-safe-hover-scale size-full object-cover"
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent"
                        aria-hidden
                    />
                </>
            ) : null}
            <div className="absolute inset-x-4 bottom-4 z-10 tablet:inset-x-6 tablet:bottom-6">
                <p
                    className={cn(
                        'font-[family-name:var(--font-display)] leading-[0.95] tracking-[-0.005em] uppercase',
                        featured
                            ? 'text-[clamp(2.5rem,5vw,5rem)]'
                            : 'text-[clamp(2rem,3.5vw,3.25rem)]',
                        imageUrl
                            ? 'text-canvas drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)]'
                            : 'text-ink',
                    )}
                >
                    {name}
                </p>
            </div>
        </Link>
    );
}

export { CategoryTile };
