import { useTranslation } from 'react-i18next';

import { PdpDisclosure } from '@/components/storefront/pdp-disclosure';
import type { ProductAttribute } from '@/types/catalog';

const GROUP_LABELS: Record<string, string> = {
    tech_specs: 'pdp.techSpecs',
    details_care: 'pdp.detailsCare',
    shipping_returns: 'pdp.shippingReturns',
};

type ProductAttributesSectionProps = {
    attributes?: Record<string, ProductAttribute[]>;
};

export function ProductAttributesSection({
    attributes,
}: ProductAttributesSectionProps) {
    const { t } = useTranslation('storefront');

    if (!attributes || Object.keys(attributes).length === 0) {
        return null;
    }

    return (
        <>
            {Object.entries(attributes).map(([group, items]) => (
                <PdpDisclosure
                    key={group}
                    title={t(GROUP_LABELS[group] ?? group)}
                >
                    <dl className="space-y-2">
                        {items.map((item) => (
                            <div
                                key={`${group}-${item.key}`}
                                className="grid grid-cols-2 gap-2 text-caption-md"
                            >
                                <dt className="text-mute">{item.label}</dt>
                                <dd className="text-ink">{item.value}</dd>
                            </div>
                        ))}
                    </dl>
                </PdpDisclosure>
            ))}
        </>
    );
}
