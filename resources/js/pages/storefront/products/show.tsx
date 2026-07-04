import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { AddToBagButton } from '@/components/storefront/add-to-bag-button';
import { StorefrontBadge } from '@/components/storefront/Badge';
import { Breadcrumb } from '@/components/storefront/breadcrumb';
import { NikeByYouCustomizer } from '@/components/storefront/nike-by-you-customizer';
import { OptionPicker } from '@/components/storefront/option-picker';
import { PageSeo } from '@/components/storefront/page-seo';
import type { SeoData } from '@/components/storefront/page-seo';
import { StructuredData } from '@/components/storefront/structured-data';
import { PdpDisclosure } from '@/components/storefront/pdp-disclosure';
import { PdpStickyMobileBar } from '@/components/storefront/pdp-sticky-mobile-bar';
import { ProductAttributesSection } from '@/components/storefront/product-attributes-section';
import { ProductGallery } from '@/components/storefront/product-gallery';
import {
    ProductRail,
    ProductRailItem,
} from '@/components/storefront/product-rail';
import { ProductReviewsSection } from '@/components/storefront/product-reviews-section';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ScrollReveal } from '@/components/storefront/scroll-reveal';
import { StarRating } from '@/components/storefront/star-rating';
import { StockStatus } from '@/components/storefront/stock-status';
import { SustainabilityAccordion } from '@/components/storefront/sustainability-accordion';
import { WishlistButton } from '@/components/storefront/wishlist-button';
import { useCart } from '@/contexts/cart-context';
import { formatCurrency, useLocale } from '@/hooks/use-locale';
import {
    buildSelectionFromVariant,
    formatOptionsLabel,
    getAvailableValueIds,
    getGalleryImages,
    resolveVariant,
    type SelectedOptions,
} from '@/lib/variant-selection';
import type { ProductDetail, ProductSummary } from '@/types/catalog';

type ProductDetailPageProps = {
    product: ProductDetail;
    relatedProducts: { data: ProductSummary[] };
    seo: SeoData;
    structuredData: Record<string, unknown>[];
    initialVariantId?: number | null;
};

export default function ProductDetailPage({
    product,
    relatedProducts,
    seo,
    structuredData,
    initialVariantId = null,
}: ProductDetailPageProps) {
    const { t } = useTranslation('storefront');
    const { locale, currency } = useLocale();
    const detail = product;
    const { addItem } = useCart();

    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => {
        if (initialVariantId) {
            const variant = detail.variants.find((v) => v.id === initialVariantId);

            if (variant) {
                return buildSelectionFromVariant(variant, detail.options);
            }
        }

        const initial: SelectedOptions = {};
        for (const option of detail.options) {
            if (option.values[0]) {
                initial[option.id] = option.values[0].id;
            }
        }

        return initial;
    });

    const [customConfiguration, setCustomConfiguration] = useState<
        Record<string, { material: string; color: string }>
    >({});

    const selectedVariant = useMemo(
        () =>
            resolveVariant(
                detail.variants,
                selectedOptions,
                detail.options.length,
            ),
        [detail.variants, detail.options.length, selectedOptions],
    );

    const availableValueIds = useMemo(() => {
        const map: Record<number, number[]> = {};

        for (const option of detail.options) {
            map[option.id] = getAvailableValueIds(
                detail.variants,
                selectedOptions,
                option.id,
                detail.options,
            );
        }

        return map;
    }, [detail.options, detail.variants, selectedOptions]);

    const galleryImages = useMemo(
        () => getGalleryImages(detail.options, selectedOptions),
        [detail.options, selectedOptions],
    );

    const listPrice = detail.basePrice;
    const effectivePrice = selectedVariant?.unitPrice ?? listPrice;
    const onSale = effectivePrice < listPrice;
    const inStock = selectedVariant?.stock.inStock ?? false;
    const selectionComplete =
        Object.keys(selectedOptions).length === detail.options.length;
    const canAddToBag = selectionComplete && inStock;

    const primaryImage =
        galleryImages.find((image) => image.isPrimary) ?? galleryImages[0];

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
        if (!canAddToBag || !selectedVariant) {
            return;
        }

        const optionsLabel = formatOptionsLabel(detail.options, selectedOptions);
        const parts = optionsLabel.split(' / ');

        addItem({
            variantId: selectedVariant.id,
            productSlug: detail.slug,
            productName: detail.name,
            colorName: parts[0] ?? '',
            size: parts[1] ?? parts[0] ?? '',
            options: detail.options.map((option) => ({
                name: option.name,
                value:
                    option.values.find((v) => v.id === selectedOptions[option.id])
                        ?.value ?? '',
            })),
            unitPrice: selectedVariant.unitPrice,
            imageUrl: primaryImage?.url,
            customConfiguration:
                Object.keys(customConfiguration).length > 0
                    ? customConfiguration
                    : undefined,
        });

        toast.success(t('pdp.addedToBag'));
    };

    const handleOptionSelect = (optionId: number, valueId: number) => {
        setSelectedOptions((prev) => ({ ...prev, [optionId]: valueId }));
        setCustomConfiguration({});
    };

    useEffect(() => {
        if (initialVariantId) {
            const variant = detail.variants.find((v) => v.id === initialVariantId);

            if (variant) {
                setSelectedOptions(
                    buildSelectionFromVariant(variant, detail.options),
                );
            }
        }
    }, [initialVariantId, detail.variants, detail.options]);

    const showNikeByYou =
        detail.isCustomizable &&
        (detail.customizationOptions?.length ?? 0) > 0;

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
                            key={galleryImages.map((i) => i.url).join('-')}
                            images={galleryImages}
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
                                                currency,
                                            )}
                                        </span>
                                        <span className="text-body-strong text-mute line-through">
                                            {formatCurrency(
                                                listPrice,
                                                locale,
                                                currency,
                                            )}
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
                                        {formatCurrency(
                                            effectivePrice,
                                            locale,
                                            currency,
                                        )}
                                    </span>
                                )}
                            </div>

                            {detail.options.length > 0 ? (
                                <OptionPicker
                                    options={detail.options}
                                    selected={selectedOptions}
                                    availableValueIds={availableValueIds}
                                    onSelect={handleOptionSelect}
                                />
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

                                <ProductAttributesSection
                                    attributes={detail.attributes}
                                />

                                <PdpDisclosure title={t('pdp.shippingReturns')}>
                                    <p className="text-caption-md text-mute">
                                        {t('pdp.shippingReturnsBody')}
                                    </p>
                                </PdpDisclosure>

                                {detail.sustainability &&
                                (detail.sustainability.materials?.length ?? 0) >
                                    0 ? (
                                    <SustainabilityAccordion
                                        weightedRecycledPercent={
                                            detail.sustainability
                                                .weightedRecycledPercent
                                        }
                                        materials={
                                            detail.sustainability.materials
                                        }
                                    />
                                ) : null}

                                {showNikeByYou ? (
                                    <PdpDisclosure title={t('pdp.nikeByYou')}>
                                        <NikeByYouCustomizer
                                            options={
                                                detail.customizationOptions ??
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
                                        slug={item.slug}
                                        name={item.name}
                                        subtitle={item.subTitle ?? undefined}
                                        imageUrl={item.primaryImage?.url}
                                        price={item.listPrice}
                                        salePrice={item.salePrice ?? undefined}
                                        colorways={item.colorwaySwatches}
                                        defaultVariantId={
                                            item.defaultVariantId ?? undefined
                                        }
                                        defaultVariantPrice={
                                            item.defaultVariantPrice ?? undefined
                                        }
                                        inStock={item.inStock}
                                    />
                                </ProductRailItem>
                            ))}
                        </ProductRail>
                    </ScrollReveal>
                ) : null}
            </div>

            <PdpStickyMobileBar
                productName={detail.name}
                colorName={formatOptionsLabel(detail.options, selectedOptions)}
                imageUrl={primaryImage?.url}
                price={effectivePrice}
                disabled={!canAddToBag}
                onAddToBag={handleAddToBag}
                observeRef={addToBagRef}
            />
        </>
    );
}
