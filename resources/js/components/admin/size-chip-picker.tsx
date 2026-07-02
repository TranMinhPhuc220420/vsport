import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { adminInputClassName } from '@/components/admin/ui/admin-input-styles';
import { cn } from '@/lib/utils';

export const PRESET_SIZES = [
    'US 6',
    'US 7',
    'US 8',
    'US 9',
    'US 10',
    'US 11',
    'US 12',
    'US 13',
] as const;

type SizeChipPickerProps = {
    value: string[];
    onChange: (sizes: string[]) => void;
    className?: string;
};

export function SizeChipPicker({
    value,
    onChange,
    className,
}: SizeChipPickerProps) {
    const { t } = useTranslation('admin');
    const [customSize, setCustomSize] = useState('');

    const toggleSize = (size: string) => {
        if (value.includes(size)) {
            onChange(value.filter((s) => s !== size));
        } else {
            onChange([...value, size].sort());
        }
    };

    const addCustomSize = () => {
        const trimmed = customSize.trim();

        if (!trimmed || value.includes(trimmed)) {
            return;
        }

        onChange([...value, trimmed]);
        setCustomSize('');
    };

    return (
        <div className={cn('space-y-3', className)}>
            <p className="admin-caption">{t('products.sizePickerHint')}</p>
            <div className="flex flex-wrap gap-2">
                {PRESET_SIZES.map((size) => {
                    const selected = value.includes(size);

                    return (
                        <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={cn(
                                'rounded-admin-sm border px-3 py-1.5 text-sm font-medium transition-colors',
                                selected
                                    ? 'border-[var(--admin-primary)] bg-[var(--admin-primary)] text-[var(--admin-on-primary)]'
                                    : 'border-admin bg-[var(--admin-surface)] text-[var(--admin-primary)] hover:bg-[var(--admin-neutral)]',
                            )}
                        >
                            {size}
                        </button>
                    );
                })}
            </div>
            <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-1.5">
                    <label className="admin-label">
                        {t('products.customSize')}
                    </label>
                    <input
                        className={cn(adminInputClassName, 'max-w-[160px]')}
                        value={customSize}
                        onChange={(e) => setCustomSize(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addCustomSize();
                            }
                        }}
                    />
                </div>
                <button
                    type="button"
                    onClick={addCustomSize}
                    className="admin-caption text-[var(--admin-primary)] hover:underline"
                >
                    {t('products.addSize')}
                </button>
            </div>
            {value.length > 0 && (
                <p className="admin-caption">
                    {t('products.selectedSizes', {
                        sizes: value.join(', '),
                    })}
                </p>
            )}
        </div>
    );
}

export function sizesToArray(value: string): string[] {
    return value
        .split(',')
        .map((size) => size.trim())
        .filter(Boolean);
}
