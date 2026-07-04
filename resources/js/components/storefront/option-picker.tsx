import { useTranslation } from 'react-i18next';

import { FilterChip } from '@/components/storefront/FilterChip';
import { cn } from '@/lib/utils';
import type { ProductOption } from '@/types/catalog';

type OptionPickerProps = {
    options: ProductOption[];
    selected: Record<number, number>;
    availableValueIds: Record<number, number[]>;
    onSelect: (optionId: number, valueId: number) => void;
    className?: string;
};

function SwatchButton({
    value,
    active,
    disabled,
    onClick,
}: {
    value: { id: number; value: string; swatchHex?: string; images?: { url: string }[] };
    active: boolean;
    disabled: boolean;
    onClick: () => void;
}) {
    const thumbnail = value.images?.find((img) => img.url)?.url;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'size-14 overflow-hidden border border-hairline bg-soft-cloud transition-[ring-color] duration-200',
                active ? 'ring-2 ring-ink' : 'ring-0 ring-transparent',
                disabled && 'cursor-not-allowed opacity-40',
            )}
            aria-label={value.value}
            aria-pressed={active}
        >
            {thumbnail ? (
                <img
                    src={thumbnail}
                    alt={value.value}
                    loading="lazy"
                    className="size-full object-cover"
                />
            ) : (
                <span
                    className="block size-full"
                    style={{ backgroundColor: value.swatchHex ?? '#e5e5e5' }}
                />
            )}
        </button>
    );
}

function OptionPicker({
    options,
    selected,
    availableValueIds,
    onSelect,
    className,
}: OptionPickerProps) {
    const { t } = useTranslation('storefront');

    const sortedOptions = [...options].sort((a, b) => a.position - b.position);

    return (
        <div data-slot="option-picker" className={cn('space-y-5', className)}>
            {sortedOptions.map((option) => {
                const selectedValue = option.values.find(
                    (value) => value.id === selected[option.id],
                );
                const available = availableValueIds[option.id] ?? [];

                const coreValues = option.values.filter(
                    (value) => (value.metadata?.edition ?? option.metadata?.edition) !== 'limited',
                );
                const limitedValues = option.values.filter(
                    (value) => (value.metadata?.edition ?? option.metadata?.edition) === 'limited',
                );
                const showGrouped =
                    option.displayType === 'swatch' &&
                    limitedValues.length > 0 &&
                    coreValues.length > 0;

                const renderValue = (value: (typeof option.values)[number]) => {
                    const isAvailable = available.includes(value.id);
                    const isActive = selected[option.id] === value.id;

                    if (option.displayType === 'swatch') {
                        return (
                            <SwatchButton
                                key={value.id}
                                value={value}
                                active={isActive}
                                disabled={!isAvailable}
                                onClick={() => onSelect(option.id, value.id)}
                            />
                        );
                    }

                    if (option.displayType === 'dropdown') {
                        return null;
                    }

                    return (
                        <FilterChip
                            key={value.id}
                            active={isActive}
                            disabled={!isAvailable}
                            onClick={() => onSelect(option.id, value.id)}
                            className={cn(!isAvailable && 'line-through opacity-50')}
                        >
                            {value.value}
                        </FilterChip>
                    );
                };

                return (
                    <div key={option.id} className="space-y-3">
                        <p className="text-caption-md text-mute">
                            {option.name}{' '}
                            <span className="text-ink">{selectedValue?.value}</span>
                        </p>

                        {option.displayType === 'dropdown' ? (
                            <select
                                className="w-full border border-hairline bg-surface px-3 py-2 text-body-strong"
                                value={selected[option.id] ?? ''}
                                onChange={(event) =>
                                    onSelect(option.id, Number(event.target.value))
                                }
                            >
                                <option value="" disabled>
                                    {t('pdp.selectOption', { option: option.name })}
                                </option>
                                {option.values.map((value) => (
                                    <option
                                        key={value.id}
                                        value={value.id}
                                        disabled={!available.includes(value.id)}
                                    >
                                        {value.value}
                                    </option>
                                ))}
                            </select>
                        ) : showGrouped ? (
                            <div className="space-y-4">
                                {coreValues.length > 0 ? (
                                    <div>
                                        <p className="text-caption-md mb-2 text-mute">Core</p>
                                        <div className="flex flex-wrap gap-2">
                                            {coreValues.map(renderValue)}
                                        </div>
                                    </div>
                                ) : null}
                                {limitedValues.length > 0 ? (
                                    <div>
                                        <p className="text-caption-md mb-2 text-mute">Limited</p>
                                        <div className="flex flex-wrap gap-2">
                                            {limitedValues.map(renderValue)}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {option.values.map(renderValue)}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export { OptionPicker };
