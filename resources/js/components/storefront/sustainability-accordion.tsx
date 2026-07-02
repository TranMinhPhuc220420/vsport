import { useTranslation } from 'react-i18next';

import { PdpDisclosure } from '@/components/storefront/pdp-disclosure';

type SustainabilityMaterial = {
    componentName: string;
    materialType: string;
    componentWeightG: number;
    recycledContentPct: number;
};

type SustainabilityAccordionProps = {
    weightedRecycledPercent: number;
    materials: SustainabilityMaterial[];
};

export function SustainabilityAccordion({
    weightedRecycledPercent,
    materials,
}: SustainabilityAccordionProps) {
    const { t } = useTranslation('storefront');

    if (materials.length === 0) {
        return null;
    }

    return (
        <PdpDisclosure
            title={t('pdp.moveToZero', {
                percent: weightedRecycledPercent,
            })}
        >
            <ul className="text-caption-md space-y-3 text-mute">
                {materials.map((material) => (
                    <li key={material.componentName}>
                        {t('pdp.materialLine', {
                            componentName: material.componentName,
                            materialType: material.materialType,
                            weight: material.componentWeightG,
                            recycledPct: material.recycledContentPct,
                        })}
                    </li>
                ))}
            </ul>
        </PdpDisclosure>
    );
}
