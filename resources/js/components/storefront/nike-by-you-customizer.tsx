import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterChip } from '@/components/storefront/FilterChip';
import { cn } from '@/lib/utils';

type CustomizationOption = {
    componentName: string;
    allowedMaterials: string[];
    allowedColors: Array<{ hex: string; name: string }>;
};

type NikeByYouCustomizerProps = {
    options: CustomizationOption[];
    onChange: (
        configuration: Record<string, { material: string; color: string }>,
    ) => void;
};

export function NikeByYouCustomizer({
    options,
    onChange,
}: NikeByYouCustomizerProps) {
    const { t } = useTranslation('storefront');
    const [selections, setSelections] = useState<
        Record<string, { material: string; color: string }>
    >({});

    const configuration = useMemo(() => selections, [selections]);

    const updateSelection = (
        componentName: string,
        patch: Partial<{ material: string; color: string }>,
    ) => {
        setSelections((current) => {
            const option = options.find(
                (item) => item.componentName === componentName,
            );
            const next = {
                ...current,
                [componentName]: {
                    material:
                        patch.material ??
                        current[componentName]?.material ??
                        option?.allowedMaterials[0] ??
                        '',
                    color:
                        patch.color ??
                        current[componentName]?.color ??
                        option?.allowedColors[0]?.hex ??
                        '',
                },
            };
            onChange(next);

            return next;
        });
    };

    if (options.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            <p className="text-caption-md text-mute">
                {t('pdp.nikeByYouDesc')}
            </p>
            {options.map((option) => (
                <div key={option.componentName}>
                    <p className="text-body-strong text-ink">
                        {option.componentName}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {option.allowedMaterials.map((material) => (
                            <FilterChip
                                key={material}
                                active={
                                    configuration[option.componentName]
                                        ?.material === material
                                }
                                onClick={() =>
                                    updateSelection(option.componentName, {
                                        material,
                                    })
                                }
                            >
                                {material}
                            </FilterChip>
                        ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {option.allowedColors.map((color) => (
                            <button
                                key={color.hex}
                                type="button"
                                title={color.name}
                                className={cn(
                                    'size-8 rounded-full ring-1 ring-hairline',
                                    configuration[option.componentName]
                                        ?.color === color.hex &&
                                        'ring-2 ring-ink',
                                )}
                                style={{ backgroundColor: color.hex }}
                                onClick={() =>
                                    updateSelection(option.componentName, {
                                        color: color.hex,
                                    })
                                }
                                aria-label={color.name}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
