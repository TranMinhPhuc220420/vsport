import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { PageSeo, type SeoData } from '@/components/storefront/page-seo';
import { AddToBagButton } from '@/components/storefront/add-to-bag-button';
import { ColorwayPicker } from '@/components/storefront/colorway-picker';
import { NikeByYouCustomizer } from '@/components/storefront/nike-by-you-customizer';
import { PdpStickyMobileBar } from '@/components/storefront/pdp-sticky-mobile-bar';
import { ProductGallery } from '@/components/storefront/product-gallery';
import { ProductReviewsSection } from '@/components/storefront/product-reviews-section';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { SizePicker } from '@/components/storefront/size-picker';
import { StockStatus } from '@/components/storefront/stock-status';
import { SustainabilityAccordion } from '@/components/storefront/sustainability-accordion';
import { StorefrontBadge } from '@/components/storefront/Badge';
import { WishlistButton } from '@/components/storefront/wishlist-button';
import { useCart } from '@/contexts/cart-context';
import { formatCurrency, useLocale } from '@/hooks/use-locale';
import type { ProductDetail } from '@/types/catalog';

type ProductDetailPageProps = {
    product: ProductDetail;
    seo: SeoData;
};

export default function ProductDetailPage({ product, seo }: ProductDetailPageProps) {
    const { t } = useTranslation('storefront');
    const { locale } = useLocale();
    const detail = product;
    const { addItem } = useCart();
    const [selectedColorwayId, setSelectedColorwayId] = useState(
        detail.colorways[0]?.id ?? 0,
    );
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [customConfiguration, setCustomConfiguration] = useState<
        Record<string, { material: string; color: string }>
    >({});

    const selectedColorway = useMemo(
        () =>
            detail.colorways.find((c) => c.id === selectedColorwayId) ??
            detail.colorways[0],
        [detail.colorways, selectedColorwayId],
    );

    const selectedVariant = useMemo(
        () =>
            selectedColorway?.variants.find((v) => v.size === selectedSize) ??
            null,
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

    return (
        <>
            <PageSeo seo={seo} />

            <div className="storefront-container storefront-section-compact">
                <div className="grid gap-8 desktop:grid-cols-2 desktop:gap-8">
                    <ProductGallery
                        key={selectedColorway?.id}
                        images={selectedColorway?.images ?? []}
                        productName={detail.name}
                    />

                    <div className="flex flex-col gap-4">
                        <div>
                            <p className="text-caption-md text-mute">
                                {detail.subTitle}
                            </p>
                            <h1 className="mt-2 text-heading-xl text-ink">
                                {detail.name}
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {onSale ? (
                                <>
                                    <span className="text-heading-lg text-sale">
                                        {formatCurrency(effectivePrice, locale)}
                                    </span>
                                    <span className="text-body-strong text-mute line-through">
                                        {formatCurrency(listPrice, locale)}
                                    </span>
                                    <StorefrontBadge variant="sale">
                                        {t('pdp.percentOff', {
                                            percent: Math.round(
                                                ((listPrice - effectivePrice) /
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

                        {selectedColorway && (
                            <ColorwayPicker
                                colorways={detail.colorways}
                                selectedId={selectedColorway.id}
                                onSelect={handleColorwayChange}
                            />
                        )}

                        {selectedColorway && (
                            <SizePicker
                                variants={selectedColorway.variants}
                                selectedSize={selectedSize}
                                onSelect={setSelectedSize}
                            />
                        )}

                        {selectedVariant && (
                            <StockStatus inStock={selectedVariant.stock.inStock} />
                        )}

                        {selectedColorway?.isCustomizable &&
                            (selectedColorway.customizationOptions?.length ?? 0) > 0 && (
                                <NikeByYouCustomizer
                                    options={
                                        selectedColorway.customizationOptions ?? []
                                    }
                                    onChange={setCustomConfiguration}
                                />
                            )}

                        {selectedColorway?.sustainability && (
                            <SustainabilityAccordion
                                weightedRecycledPercent={
                                    selectedColorway.sustainability
                                        .weightedRecycledPercent
                                }
                                materials={
                                    selectedColorway.sustainability.materials
                                }
                            />
                        )}

                        <div ref={addToBagRef}>
                            <AddToBagButton
                                disabled={!canAddToBag}
                                onClick={handleAddToBag}
                            />
                        </div>

                        <WishlistButton
                            showLabel
                            className="w-full"
                            item={{
                                productSlug: detail.slug,
                                productName: detail.name,
                                imageUrl: primaryImage?.url,
                                price: listPrice,
                                salePrice: onSale ? effectivePrice : undefined,
                            }}
                        />

                        {detail.description && (
                            <p className="border-t border-hairline pt-6 text-body-strong text-mute">
                                {detail.description}
                            </p>
                        )}
                    </div>
                </div>

                <ScrollReveal className="mt-8">
                    <ProductReviewsSection
                        productSlug={detail.slug}
                        averageRating={detail.averageRating ?? 0}
                        reviewCount={detail.reviewCount ?? 0}
                        reviews={detail.reviews}
                    />
                </ScrollReveal>
            </div>

            <PdpStickyMobileBar
                productName={detail.name}
                price={effectivePrice}
                disabled={!canAddToBag}
                onAddToBag={handleAddToBag}
                observeRef={addToBagRef}
            />
        </>
    );
}
