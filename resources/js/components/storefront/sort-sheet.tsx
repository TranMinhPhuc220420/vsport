import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';

type SortOption = {
    value: string;
    label: string;
};

type SortSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    options: SortOption[];
    value: string;
    onChange: (value: string) => void;
};

function SortSheet({ open, onOpenChange, options, value, onChange }: SortSheetProps) {
    const { t } = useTranslation('storefront');

    const handleSelect = (v: string) => {
        onChange(v);
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className="vsport-light rounded-t-2xl border-t border-hairline bg-canvas px-0"
            >
                <SheetHeader className="border-b border-hairline-soft px-6 py-4">
                    <SheetTitle className="text-body-strong text-ink">
                        {t('plp.sortTitle')}
                    </SheetTitle>
                </SheetHeader>

                <ul className="py-2">
                    {options.map((option) => (
                        <li key={option.value}>
                            <button
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className="text-body-strong flex w-full items-center justify-between px-6 py-4 text-ink active:bg-soft-cloud"
                            >
                                {option.label}
                                {option.value === value && (
                                    <Check className="size-4 text-ink" />
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </SheetContent>
        </Sheet>
    );
}

export { SortSheet };
