import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import { useLocale } from '@/hooks/use-locale';
import type { AppLocale } from '@/i18n';
import { cn } from '@/lib/utils';

const LOCALE_FLAGS: Record<AppLocale, string> = {
    en: '🇺🇸',
    vi: '🇻🇳',
};

type LanguageSwitcherProps = {
    className?: string;
    compact?: boolean;
};

function LocaleOption({
    code,
    label,
    showLabel = true,
}: {
    code: AppLocale;
    label: string;
    showLabel?: boolean;
}) {
    return (
        <span className="inline-flex min-w-0 items-center gap-1.5">
            <span className="text-base leading-none" aria-hidden>
                {LOCALE_FLAGS[code]}
            </span>
            {showLabel ? (
                <span className="truncate">{label}</span>
            ) : null}
        </span>
    );
}

export function LanguageSwitcher({
    className,
    compact = false,
}: LanguageSwitcherProps) {
    const { locale, locales, updateLocale } = useLocale();
    const activeLocale = locales.find((option) => option.code === locale);

    return (
        <Select
            value={locale}
            onValueChange={(value) => updateLocale(value as AppLocale)}
        >
            <SelectTrigger
                className={cn(
                    'w-fit shrink-0',
                    compact
                        ? 'text-caption-sm h-7 min-w-0 gap-0.5 border-none bg-transparent px-0 shadow-none [&>svg]:size-3.5'
                        : 'text-caption-sm h-8 max-w-[9rem] gap-1',
                    className,
                )}
                aria-label={activeLocale?.label ?? 'Language'}
            >
                <LocaleOption
                    code={locale}
                    label={activeLocale?.label ?? locale.toUpperCase()}
                    showLabel={!compact}
                />
            </SelectTrigger>
            <SelectContent align="end" className="min-w-[9.5rem]">
                {locales.map((option) => (
                    <SelectItem key={option.code} value={option.code}>
                        <LocaleOption code={option.code} label={option.label} />
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
