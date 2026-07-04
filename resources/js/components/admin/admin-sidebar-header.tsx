import { Monitor, Moon, Search, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { LanguageSwitcher } from '@/components/language-switcher';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type Appearance, useAppearance } from '@/hooks/use-appearance';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AdminSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { t } = useTranslation('admin');
    const { appearance, resolvedAppearance, updateAppearance } =
        useAppearance();
    const [macLike, setMacLike] = useState(false);

    useEffect(() => {
        setMacLike(/Mac|iPod|iPhone|iPad/.test(navigator.platform));
    }, []);

    const appearanceOptions: { value: Appearance; icon: typeof Sun }[] = [
        { value: 'light', icon: Sun },
        { value: 'dark', icon: Moon },
        { value: 'system', icon: Monitor },
    ];

    const ResolvedIcon = resolvedAppearance === 'dark' ? Moon : Sun;

    return (
        <header className="border-admin flex h-14 shrink-0 items-center gap-2 border-b bg-[var(--admin-surface)] px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="ml-auto flex items-center gap-2">
                <button
                    type="button"
                    onClick={() =>
                        document.dispatchEvent(
                            new KeyboardEvent('keydown', {
                                key: 'k',
                                metaKey: macLike,
                                ctrlKey: !macLike,
                            }),
                        )
                    }
                    className="border-admin text-admin-secondary rounded-admin-md flex items-center gap-2 border bg-[var(--admin-neutral)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--admin-surface)]"
                >
                    <Search className="size-4" />
                    <span className="admin-caption hidden sm:inline">
                        {t('commandPalette.placeholder')}
                    </span>
                    <kbd className="admin-caption border-admin rounded-admin-sm hidden border bg-[var(--admin-surface)] px-1.5 py-0.5 sm:inline">
                        {macLike ? '⌘K' : 'Ctrl K'}
                    </kbd>
                </button>

                <LanguageSwitcher
                    className="border-admin text-admin-secondary rounded-admin-md h-8 min-w-[7.5rem] max-w-[9.5rem] gap-1.5 border bg-[var(--admin-neutral)] px-2.5 shadow-none transition-colors hover:bg-[var(--admin-surface)]"
                />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            aria-label={t('commandPalette.placeholder')}
                            className="border-admin text-admin-secondary rounded-admin-md flex size-8 items-center justify-center border bg-[var(--admin-neutral)] transition-colors hover:bg-[var(--admin-surface)]"
                        >
                            <ResolvedIcon className="size-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {appearanceOptions.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => updateAppearance(option.value)}
                                className={
                                    appearance === option.value
                                        ? 'font-medium'
                                        : undefined
                                }
                            >
                                <option.icon className="size-4" />
                                <span className="capitalize">
                                    {option.value}
                                </span>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
