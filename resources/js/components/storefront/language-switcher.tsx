import { Check } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/hooks/use-locale';
import type { AppLocale } from '@/i18n';
import { cn } from '@/lib/utils';

type StorefrontLanguageSwitcherProps = {
    variant?: 'utility' | 'drawer';
    className?: string;
};

function StorefrontLanguageSwitcher({
    variant = 'utility',
    className,
}: StorefrontLanguageSwitcherProps) {
    const { locale, locales, updateLocale } = useLocale();
    const activeLocale = locales.find((option) => option.code === locale);

    const handleSelect = (code: AppLocale) => {
        if (code !== locale) {
            updateLocale(code);
        }
    };

    if (variant === 'drawer') {
        return (
            <div
                className={cn('flex flex-wrap items-center gap-4', className)}
                role="group"
                aria-label={activeLocale?.label ?? 'Language'}
            >
                {locales.map((option) => {
                    const isActive = option.code === locale;

                    return (
                        <button
                            key={option.code}
                            type="button"
                            onClick={() => handleSelect(option.code)}
                            className={cn(
                                'text-body-strong transition-colors hover:underline',
                                isActive
                                    ? 'text-ink underline decoration-ink underline-offset-4'
                                    : 'text-mute hover:text-ink',
                            )}
                            aria-current={isActive ? 'true' : undefined}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        'text-caption-sm inline-flex items-center text-ink transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2',
                        className,
                    )}
                    aria-label={activeLocale?.label ?? 'Language'}
                >
                    {activeLocale?.label ?? locale.toUpperCase()}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={6}
                className="vsport-light rounded-none border border-hairline bg-canvas p-1 shadow-none"
            >
                {locales.map((option) => {
                    const isActive = option.code === locale;

                    return (
                        <DropdownMenuItem
                            key={option.code}
                            onSelect={() => handleSelect(option.code)}
                            className={cn(
                                'text-caption-sm cursor-pointer rounded-none px-3 py-2 text-ink focus:bg-soft-cloud focus:text-ink',
                                isActive && 'bg-soft-cloud',
                            )}
                        >
                            <span className="flex-1">{option.label}</span>
                            {isActive ? (
                                <Check
                                    className="size-3.5 text-ink"
                                    aria-hidden
                                />
                            ) : null}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export { StorefrontLanguageSwitcher };
