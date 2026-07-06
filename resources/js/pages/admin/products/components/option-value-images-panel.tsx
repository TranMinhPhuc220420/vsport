import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AdminSelectField } from '@/components/admin/admin-field';
import { AdminFormSection } from '@/components/admin/admin-form-section';
import { ColorwayImageManager } from '@/components/admin/colorway-image-manager';
import { getGalleryOptionValues } from '@/types/admin-product';
import type { AdminProduct } from '@/types/admin-product';

type OptionValueImagesPanelProps = {
    product: AdminProduct;
};

export function OptionValueImagesPanel({
    product,
}: OptionValueImagesPanelProps) {
    const { t } = useTranslation('admin');
    const galleryValues = getGalleryOptionValues(product);
    const [activeValueId, setActiveValueId] = useState(
        galleryValues[0]?.id ?? 0,
    );

    const activeValue = galleryValues.find(
        (value) => value.id === activeValueId,
    );

    if (galleryValues.length === 0) {
        return (
            <p className="text-admin-secondary text-sm">
                {t('products.noGalleryOptions')}
            </p>
        );
    }

    return (
        <AdminFormSection title={t('products.tabImages')}>
            <AdminSelectField
                label={t('products.galleryOptionValue')}
                value={activeValueId}
                onChange={(value) => setActiveValueId(Number(value))}
                options={galleryValues.map((value) => ({
                    value: value.id,
                    label: value.value,
                }))}
            />

            {activeValue ? (
                <ColorwayImageManager
                    key={activeValue.id}
                    colorwayId={activeValue.id}
                    productName={product.name}
                    colorName={activeValue.value}
                    initialImages={activeValue.images}
                />
            ) : null}
        </AdminFormSection>
    );
}
