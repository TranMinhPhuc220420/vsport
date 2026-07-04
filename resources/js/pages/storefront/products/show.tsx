import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AddToBagButton } from '@/components/storefront/add-to-bag-button';
import { StorefrontBadge } from '@/components/storefront/Badge';
import { Breadcrumb } from '@/components/storefront/breadcrumb';
import { ColorwayPicker } from '@/components/storefront/colorway-picker';
import { NikeByYouCustomizer } from '@/components/storefront/nike-by-you-customizer';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { StructuredData } from '@/components/storefront/structured-data';
import { PdpDisclosure } from '@/components/storefront/pdp-disclosure';
import { PdpStickyMobileBar } from '@/components/storefront/pdp-sticky-mobile-bar';
import { ProductGallery } from '@/components/storefront/product-gallery';
import {
    ProductRail,
    ProductRailItem,
} from '@/components/storefront/product-rail';
import { ProductReviewsSection } from '@/components/storefront/product-reviews-section';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { SizePicker } from '@/components/storefront/size-picker';
import { StarRating } from '@/components/storefront/star-rating';
import { StockStatus } from '@/components/storefront/stock-status';
import { SustainabilityAccordion } from '@/components/storefront/sustainability-accordion';
import { WishlistButton } from '@/components/storefront/wishlist-button';
import { useCart } from '@/contexts/cart-context';
import { formatCurrency, useLocale } from '@/hooks/use-locale';
import type { ProductDetail, ProductSummary } from '@/types/catalog';

type ProductDetailPageProps = {
    product: ProductDetail;
    relatedProducts: { data: ProductSummary[] };
    seo: SeoData;
    structuredData: Record<string, unknown>[];
};

export default function ProductDetailPage({
    product,
    relatedProducts,
    seo,
    structuredData,
}: ProductDetailPageProps) {
    const { t } = useTranslation('storefront');
    const { locale } = useLocale();
    const detail = product;
    const { addItem } = useCart();
    const [selectedColorwayId, setSelectedColorwayId] = useState(
        detail.colorways[0]?.id ?? 0,
    );
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
    const [customConfiguration, setCustomConfiguration] = useState<
        Record<string, { material: string; color: string }>
    >({});

    const selectedColorway = useMemo(
        () =>
            detail.colorways.find((colorway) => colorway.id === selectedColorwayId) ??
            detail.colorways[0],
        [detail.colorways, selectedColorwayId],
    );

    const selectedVariant = useMemo(
        () =>
            selectedColorway?.variants.find(
                (variant) => variant.size === selectedSize,
            ) ?? null,
        [selectedColorway, selectedSize],
    );

    const listPrice = detail.basePrice;
    const salePrice = selectedColorway?.discountPrice;
    const effectivePrice = selectedColorway?.effectivePrice ?? listPrice;
    const onSale = salePrice !== null && salePrice < listPrice;
    const inStock = selectedVariant?.stock.inStock ?? false;
    const canAddToBag = selectedSize !== null && inStock;

    const primaryImage =
        selectedColorway?.images.find((image) => image.isPrimary) ??
        selectedColorway?.images[0];

    const addToBagRef = useRef<HTMLDivElement>(null);

    const breadcrumbItems = [
        { label: t('pdp.breadcrumbHome'), href: '/' },
        ...(detail.category
            ? [
                  {
                      label: detail.category.name,
                      href: `/${detail.category.slug}`,
                  },
              ]
            : []),
        { label: detail.name },
    ];

    const handleAddToBag = () => {
        if (!canAddToBag || !selectedVariant || !selectedColorway) {
            return;
        }

        addItem({
            variantId: selectedVariant.id,
            productSlug: detail.slug,
            productName: detail.name,
            colorName: selectedColorway.colorName,
            size: selectedVariant.size,
            unitPrice: selectedVariant.unitPrice,
            imageUrl: primaryImage?.url,
            customConfiguration:
                Object.keys(customConfiguration).length > 0
                    ? customConfiguration
                    : undefined,
        });

        toast.success(t('pdp.addedToBag'));
    };

    const handleColorwayChange = (id: number) => {
        setSelectedColorwayId(id);
        setSelectedSize(null);
        setCustomConfiguration({});
    };

    const showNikeByYou =
        selectedColorway?.isCustomizable &&
        (selectedColorway.customizationOptions?.length ?? 0) > 0;

    return (
        <>
            <PageSeo seo={seo} />
            <StructuredData data={structuredData} />

            <div className="storefront-container storefront-section-compact">
                <ScrollReveal>
                    <Breadcrumb items={breadcrumbItems} className="mb-6" />
                </ScrollReveal>

                <div className="grid gap-8 desktop:grid-cols-2 desktop:gap-10">
                    <ScrollReveal direction="left">
                        <ProductGallery
                            key={selectedColorway?.id}
                            images={selectedColorway?.images ?? []}
                            productName={detail.name}
                        />
                    </ScrollReveal>

                    <ScrollReveal
                        direction="right"
                        className="desktop:sticky desktop:top-24 desktop:self-start"
                    >
                        <div className="flex flex-col gap-5">
                            <div>
                                {detail.subTitle ? (
                                    <p className="text-caption-md text-mute">
                                        {detail.subTitle}
                                    </p>
                                ) : null}
                                <h1 className="text-heading-xl mt-2 text-ink">
                                    {detail.name}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    {(detail.reviewCount ?? 0) > 0 ? (
                                        <a href="#reviews" className="hover:opacity-80">
                                            <StarRating
                                                rating={detail.averageRating ?? 0}
                                                size="sm"
                                                showCount
                                                reviewCount={
                                                    detail.reviewCount ?? 0
                                                }
                                            />
                                        </a>
                                    ) : null}
                                    <span className="text-caption-md text-mute">
                                        {detail.styleCode} · {detail.gender}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {onSale ? (
                                    <>
                                        <span className="text-heading-lg text-sale">
                                            {formatCurrency(
                                                effectivePrice,
                                                locale,
                                            )}
                                        </span>
                                        <span className="text-body-strong text-mute line-through">
                                            {formatCurrency(listPrice, locale)}
                                        </span>
                                        <StorefrontBadge variant="sale">
                                            {t('pdp.percentOff', {
                                                percent: Math.round(
                                                    ((listPrice -
                                                        effectivePrice) /
                                                        listPrice) *
                                                        100,
                                                ),
                                            })}
                                        </StorefrontBadge>
                                    </>
                                ) : (
                                    <span className="text-heading-lg text-ink">
                                        {formatCurrency(effectivePrice, locale)}
                                    </span>
                                )}
                            </div>

                            {selectedColorway ? (
                                <ColorwayPicker
                                    colorways={detail.colorways}
                                    selectedId={selectedColorway.id}
                                    onSelect={handleColorwayChange}
                                />
                            ) : null}

                            {selectedColorway ? (
                                <SizePicker
                                    variants={selectedColorway.variants}
                                    selectedSize={selectedSize}
                                    onSelect={setSelectedSize}
                                    onSizeGuideClick={() =>
                                        setSizeGuideOpen((open) => !open)
                                    }
                                />
                            ) : null}

                            {sizeGuideOpen ? (
                                <p className="text-caption-md rounded-pill-lg bg-soft-cloud px-4 py-3 text-mute">
                                    {t('pdp.sizeGuideBody')}
                                </p>
                            ) : null}

                            <div
                                ref={addToBagRef}
                                className="flex items-center gap-2"
                            >
                                <AddToBagButton
                                    disabled={!canAddToBag}
                                    onClick={handleAddToBag}
                                    className="w-full flex-1"
                                />
                                <WishlistButton
                                    item={{
                                        productSlug: detail.slug,
                                        productName: detail.name,
                                        imageUrl: primaryImage?.url,
                                        price: listPrice,
                                        salePrice: onSale
                                            ? effectivePrice
                                            : undefined,
                                    }}
                                />
                            </div>

                            {selectedVariant ? (
                                <StockStatus
                                    inStock={selectedVariant.stock.inStock}
                                />
                            ) : null}

                            <div className="border-t border-hairline">
                                {detail.description ? (
                                    <PdpDisclosure
                                        title={t('pdp.details')}
                                        defaultOpen
                                    >
                                        <p className="text-body-strong text-mute">
                                            {detail.description}
                                        </p>
                                    </PdpDisclosure>
                                ) : null}

                                <PdpDisclosure title={t('pdp.shippingReturns')}>
                                    <p className="text-caption-md text-mute">
                                        {t('pdp.shippingReturnsBody')}
                                    </p>
                                </PdpDisclosure>

                                {selectedColorway?.sustainability ? (
                                    <SustainabilityAccordion
                                        weightedRecycledPercent={
                                            selectedColorway.sustainability
                                                .weightedRecycledPercent
                                        }
                                        materials={
                                            selectedColorway.sustainability
                                                .materials
                                        }
                                    />
                                ) : null}

                                {showNikeByYou ? (
                                    <PdpDisclosure title={t('pdp.nikeByYou')}>
                                        <NikeByYouCustomizer
                                            options={
                                                selectedColorway.customizationOptions ??
                                                []
                                            }
                                            onChange={setCustomConfiguration}
                                        />
                                    </PdpDisclosure>
                                ) : null}
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                <ScrollReveal className="mt-12">
                    <ProductReviewsSection
                        productSlug={detail.slug}
                        averageRating={detail.averageRating ?? 0}
                        reviewCount={detail.reviewCount ?? 0}
                        reviews={detail.reviews}
                    />
                </ScrollReveal>

                {relatedProducts.data.length > 0 ? (
                    <ScrollReveal className="mt-12">
                        <h2 className="text-heading-xl text-ink">
                            {t('pdp.relatedTitle')}
                        </h2>
                        <ProductRail className="mt-6">
                            {relatedProducts.data.map((item, index) => (
                                <ProductRailItem key={item.id} index={index}>
                                    <ProductCard
                                        href={`/products/${item.slug}`}
                                        name={item.name}
                                        subtitle={item.subTitle ?? undefined}
                                        imageUrl={item.primaryImage?.url}
                                        price={item.listPrice}
                                        salePrice={item.salePrice ?? undefined}
                                        colorways={item.colorwaySwatches}
                                    />
                                </ProductRailItem>
                            ))}
                        </ProductRail>
                    </ScrollReveal>
                ) : null}
            </div>

            <PdpStickyMobileBar
                productName={detail.name}
                colorName={selectedColorway?.colorName}
                imageUrl={primaryImage?.url}
                price={effectivePrice}
                disabled={!canAddToBag}
                onAddToBag={handleAddToBag}
                observeRef={addToBagRef}
            />
        </>
    );
}
