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
};

function LocaleOption({
    code,
    label,
}: {
    code: AppLocale;
    label: string;
}) {
    return (
        <span className="inline-flex min-w-0 items-center gap-1.5">
            <span className="text-base leading-none" aria-hidden>
                {LOCALE_FLAGS[code]}
            </span>
            <span className="truncate">{label}</span>
        </span>
    );
}

/**
 * Admin / settings language picker. Storefront uses StorefrontLanguageSwitcher.
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
    const { locale, locales, updateLocale } = useLocale();
    const activeLocale = locales.find((option) => option.code === locale);

    return (
        <Select
            value={locale}
            onValueChange={(value) => updateLocale(value as AppLocale)}
        >
            <SelectTrigger
                className={cn('text-caption-sm h-8 w-fit shrink-0 gap-1', className)}
                aria-label={activeLocale?.label ?? 'Language'}
            >
                <LocaleOption
                    code={locale}
                    label={activeLocale?.label ?? locale.toUpperCase()}
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
