import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type CustomizationOption = {
    componentName: string;
    allowedMaterials: string[];
    allowedColors: Array<{ hex: string; name: string }>;
};

type NikeByYouCustomizerProps = {
    options: CustomizationOption[];
    onChange: (configuration: Record<string, { material: string; color: string }>) => void;
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
            const option = options.find((o) => o.componentName === componentName);
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
        <section className="mt-8 border border-hairline p-4">
            <h2 className="text-heading-md text-ink">{t('pdp.nikeByYou')}</h2>
            <p className="mt-1 text-caption-md text-mute">
                {t('pdp.nikeByYouDesc')}
            </p>
            <div className="mt-4 space-y-4">
                {options.map((option) => (
                    <div key={option.componentName}>
                        <p className="text-body-strong text-ink">
                            {option.componentName}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {option.allowedMaterials.map((material) => (
                                <button
                                    key={material}
                                    type="button"
                                    className={`border px-3 py-1 text-caption-md ${
                                        configuration[option.componentName]
                                            ?.material === material
                                            ? 'border-ink bg-ink text-white'
                                            : 'border-hairline'
                                    }`}
                                    onClick={() =>
                                        updateSelection(option.componentName, {
                                            material,
                                        })
                                    }
                                >
                                    {material}
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {option.allowedColors.map((color) => (
                                <button
                                    key={color.hex}
                                    type="button"
                                    title={color.name}
                                    className={`size-8 rounded-full border-2 ${
                                        configuration[option.componentName]
                                            ?.color === color.hex
                                            ? 'border-ink'
                                            : 'border-transparent'
                                    }`}
                                    style={{ backgroundColor: color.hex }}
                                    onClick={() =>
                                        updateSelection(option.componentName, {
                                            color: color.hex,
                                        })
                                    }
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
