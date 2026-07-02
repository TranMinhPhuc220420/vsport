import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const [open, setOpen] = useState(false);

    if (materials.length === 0) {
        return null;
    }

    return (
        <section className="mt-8 border border-hairline">
            <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-body-strong text-ink"
                onClick={() => setOpen((value) => !value)}
            >
                <span>
                    {t('pdp.moveToZero', {
                        percent: weightedRecycledPercent,
                    })}
                </span>
                <span>{open ? '−' : '+'}</span>
            </button>
            {open && (
                <ul className="border-t border-hairline px-4 py-3 text-caption-md text-mute">
                    {materials.map((material) => (
                        <li key={material.componentName} className="py-2">
                            {t('pdp.materialLine', {
                                componentName: material.componentName,
                                materialType: material.materialType,
                                weight: material.componentWeightG,
                                recycledPct: material.recycledContentPct,
                            })}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
