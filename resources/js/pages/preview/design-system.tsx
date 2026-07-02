import { Head } from '@inertiajs/react';
import { useState, type CSSProperties } from 'react';

import {
    FilterChip,
    ProductCard,
    ProductRail,
    ProductRailItem,
    ScrollReveal,
    SearchPill,
    StorefrontBadge,
    StorefrontButton,
} from '@/components/storefront';

const mockProducts = [
    {
        name: 'Zegama 2',
        subtitle: "Men's Trail Running Shoes",
        price: 180,
        salePrice: 135,
        badge: 'Just In',
        colorways: ['#111111', '#4b4b4d', '#007d48'],
    },
    {
        name: 'Air Max Pulse',
        subtitle: "Men's Shoes",
        price: 150,
        badge: 'Coming Soon',
        colorways: ['#111111', '#f5f5f5'],
    },
    {
        name: 'Jordan 1 Low',
        subtitle: "Men's Shoes",
        price: 120,
        colorways: ['#d30005', '#111111'],
    },
];

const colorTokens = [
    { name: 'ink', className: 'bg-ink' },
    { name: 'canvas', className: 'bg-canvas border border-hairline' },
    { name: 'soft-cloud', className: 'bg-soft-cloud' },
    { name: 'sale', className: 'bg-sale' },
    { name: 'mute', className: 'bg-mute' },
    { name: 'success', className: 'bg-success' },
];

export default function DesignSystemPreview() {
    const [activeChip, setActiveChip] = useState('Men');

    return (
        <>
            <Head title="Design System Preview" />

            <div className="storefront-container storefront-section space-y-section">
                <section>
                    <h1 className="text-display-campaign text-ink">
                        Design System
                    </h1>
                    <p className="mt-4 max-w-2xl text-body-strong text-mute">
                        Nike-style tokens and storefront components for VSport.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-heading-xl text-ink">Color tokens</h2>
                    <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-6">
                        {colorTokens.map((token) => (
                            <div key={token.name} className="space-y-2">
                                <div
                                    className={`h-16 rounded-none ${token.className}`}
                                />
                                <p className="text-caption-md text-ink">
                                    {token.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-heading-xl text-ink">Typography</h2>
                    <div className="space-y-3 rounded-none border border-hairline p-6">
                        <p className="text-display-campaign text-ink">
                            Campaign Headline
                        </p>
                        <p className="text-heading-xl text-ink">
                            Heading XL — Featured Footwear
                        </p>
                        <p className="text-heading-lg text-ink">
                            Heading LG — Section title
                        </p>
                        <p className="text-body-strong text-ink">
                            Body Strong — Product name
                        </p>
                        <p className="text-caption-md text-mute">
                            Caption MD — Category subtitle
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-heading-xl text-ink">Motion</h2>
                    <p className="text-caption-md text-mute">
                        Fade-up reveal, stagger grid, and product rail scroll.
                        Respects prefers-reduced-motion.
                    </p>
                    <ScrollReveal staggerChildren className="storefront-grid">
                        {mockProducts.map((product, index) => (
                            <div
                                key={`motion-${product.name}`}
                                style={
                                    { '--stagger-index': index } as CSSProperties
                                }
                            >
                                <ProductCard {...product} />
                            </div>
                        ))}
                    </ScrollReveal>
                    <ProductRail className="mt-6">
                        {mockProducts.map((product, index) => (
                            <ProductRailItem key={`rail-${product.name}`} index={index}>
                                <ProductCard {...product} />
                            </ProductRailItem>
                        ))}
                    </ProductRail>
                </section>

                <section className="space-y-4">
                    <h2 className="text-heading-xl text-ink">Buttons</h2>
                    <div className="flex flex-wrap gap-4">
                        <StorefrontButton variant="primary">
                            Shop Now
                        </StorefrontButton>
                        <StorefrontButton variant="secondary">
                            Discover More
                        </StorefrontButton>
                        <StorefrontButton variant="outline-on-image">
                            Explore
                        </StorefrontButton>
                        <StorefrontButton variant="icon" aria-label="Icon">
                            +
                        </StorefrontButton>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-heading-xl text-ink">Badges & chips</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <StorefrontBadge variant="promo">Just In</StorefrontBadge>
                        <StorefrontBadge variant="sale">25% off</StorefrontBadge>
                        {['Men', 'Women', 'Kids'].map((chip) => (
                            <FilterChip
                                key={chip}
                                active={activeChip === chip}
                                onClick={() => setActiveChip(chip)}
                            >
                                {chip}
                            </FilterChip>
                        ))}
                    </div>
                    <div className="max-w-md">
                        <SearchPill placeholder="Search products" />
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-heading-xl text-ink">
                        Product cards (PLP grid)
                    </h2>
                    <div className="storefront-grid">
                        {mockProducts.map((product) => (
                            <ProductCard key={product.name} {...product} />
                        ))}
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-heading-xl text-ink">
                        PDP layout preview
                    </h2>
                    <div className="grid grid-cols-1 gap-8 desktop:grid-cols-2">
                        <div className="aspect-square bg-soft-cloud" />
                        <div className="space-y-4">
                            <h3 className="text-heading-xl text-ink">
                                Zegama 2
                            </h3>
                            <p className="text-caption-md text-mute">
                                Men&apos;s Trail Running Shoes
                            </p>
                            <p className="text-heading-lg text-sale">$135</p>
                            <StorefrontButton variant="primary">
                                Add to Bag
                            </StorefrontButton>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
