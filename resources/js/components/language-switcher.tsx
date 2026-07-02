import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLocale } from '@/hooks/use-locale';
import { type AppLocale } from '@/i18n';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
    className?: string;
    compact?: boolean;
};

export function LanguageSwitcher({
    className,
    compact = false,
}: LanguageSwitcherProps) {
    const { locale, locales, updateLocale } = useLocale();

    return (
        <Select
            value={locale}
            onValueChange={(value) => updateLocale(value as AppLocale)}
        >
            <SelectTrigger
                className={cn(
                    compact
                        ? 'h-7 w-[4.5rem] border-none bg-transparent px-1 text-caption-sm shadow-none'
                        : 'h-8 w-[7.5rem] text-caption-sm',
                    className,
                )}
                aria-label="Language"
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {locales.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                        {compact ? option.code.toUpperCase() : option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}