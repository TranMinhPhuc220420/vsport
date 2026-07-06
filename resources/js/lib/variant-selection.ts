import type {
    ProductImage,
    ProductOption,
    ProductVariant,
} from '@/types/catalog';

export type SelectedOptions = Record<number, number>;

export function buildSelectionFromVariant(
    variant: ProductVariant,
    options: ProductOption[],
): SelectedOptions {
    const selection: SelectedOptions = {};

    for (const option of options) {
        const valueId = variant.optionValueIds.find((id) =>
            option.values.some((value) => value.id === id),
        );

        if (valueId !== undefined) {
            selection[option.id] = valueId;
        }
    }

    return selection;
}

export function resolveVariant(
    variants: ProductVariant[],
    selected: SelectedOptions,
    optionCount: number,
): ProductVariant | null {
    const selectedIds = Object.values(selected);

    if (selectedIds.length !== optionCount) {
        return null;
    }

    return (
        variants.find((variant) => {
            const sorted = [...variant.optionValueIds].sort((a, b) => a - b);
            const selectedSorted = [...selectedIds].sort((a, b) => a - b);

            return (
                sorted.length === selectedSorted.length &&
                sorted.every((id, index) => id === selectedSorted[index])
            );
        }) ?? null
    );
}

export function getAvailableValueIds(
    variants: ProductVariant[],
    selected: SelectedOptions,
    optionId: number,
    options: ProductOption[],
): number[] {
    const option = options.find((item) => item.id === optionId);

    if (!option) {
        return [];
    }

    return option.values
        .filter((value) =>
            variants.some((variant) => {
                if (!variant.optionValueIds.includes(value.id)) {
                    return false;
                }

                return Object.entries(selected).every(([optId, valueId]) => {
                    if (Number(optId) === optionId) {
                        return true;
                    }

                    return variant.optionValueIds.includes(valueId);
                });
            }),
        )
        .map((value) => value.id);
}

export function getGalleryImages(
    options: ProductOption[],
    selected: SelectedOptions,
): ProductImage[] {
    const galleryOption =
        options.find((option) => option.drivesGallery) ??
        options.find((option) => option.displayType === 'swatch');

    if (!galleryOption) {
        return [];
    }

    const selectedValueId = selected[galleryOption.id];
    const value =
        galleryOption.values.find((item) => item.id === selectedValueId) ??
        galleryOption.values[0];

    return value?.images ?? [];
}

export function formatOptionsLabel(
    options: ProductOption[],
    selected: SelectedOptions,
): string {
    return options
        .map((option) => {
            const valueId = selected[option.id];
            const value = option.values.find((item) => item.id === valueId);

            return value?.value;
        })
        .filter(Boolean)
        .join(' / ');
}
