import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { adminNavGroups, adminQuickCreateItems } from '@/config/admin-nav';
import { toUrl } from '@/lib/utils';

/**
 * Phase 1 scope: all matching is client-side (static nav + quick-create links
 * + a couple of pattern-matched "jump to record" shortcuts). There is no
 * backend search endpoint yet, so this cannot fuzzy-match live product/order
 * data — that is an explicit Phase 2 follow-up once this UX is validated.
 */
const ORDER_NUMBER_PATTERN = /^[a-z0-9-]{4,}$/i;
const PRODUCT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)+$/i;

export function AdminCommandPalette() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { t } = useTranslation('admin');

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                setOpen((prev) => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const go = (href: string) => {
        setOpen(false);
        router.visit(href);
    };

    const trimmedQuery = query.trim();
    const looksLikeOrderNumber = ORDER_NUMBER_PATTERN.test(trimmedQuery);
    const looksLikeProductSlug = PRODUCT_SLUG_PATTERN.test(trimmedQuery);

    return (
        <CommandDialog
            open={open}
            onOpenChange={setOpen}
            title={t('commandPalette.placeholder')}
            description={t('commandPalette.placeholder')}
        >
            <CommandInput
                placeholder={t('commandPalette.placeholder')}
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                <CommandEmpty>{t('commandPalette.noResults')}</CommandEmpty>

                {trimmedQuery.length > 0 &&
                    (looksLikeOrderNumber || looksLikeProductSlug) && (
                        <CommandGroup heading={t('commandPalette.jumpTo')}>
                            {looksLikeOrderNumber && (
                                <CommandItem
                                    value={`jump-order-${trimmedQuery}`}
                                    onSelect={() =>
                                        go(`/admin/orders/${trimmedQuery}`)
                                    }
                                >
                                    {t('commandPalette.jumpToOrder', {
                                        orderNumber: trimmedQuery,
                                    })}
                                </CommandItem>
                            )}
                            {looksLikeProductSlug && (
                                <CommandItem
                                    value={`jump-product-${trimmedQuery}`}
                                    onSelect={() =>
                                        go(
                                            `/admin/products/${trimmedQuery}/edit`,
                                        )
                                    }
                                >
                                    {t('commandPalette.jumpToProduct', {
                                        slug: trimmedQuery,
                                    })}
                                </CommandItem>
                            )}
                        </CommandGroup>
                    )}

                <CommandGroup heading={t('commandPalette.quickActions')}>
                    {adminQuickCreateItems.map((item) => (
                        <CommandItem
                            key={item.titleKey}
                            value={t(item.titleKey)}
                            onSelect={() => go(toUrl(item.href))}
                        >
                            <item.icon />
                            <span>{t(item.titleKey)}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>

                {adminNavGroups.map((group) => (
                    <CommandGroup
                        key={group.key}
                        heading={`${t('commandPalette.goTo')} · ${t(group.titleKey)}`}
                    >
                        {group.items.map((item) => (
                            <CommandItem
                                key={item.titleKey}
                                value={t(item.titleKey)}
                                onSelect={() => go(toUrl(item.href))}
                            >
                                <item.icon />
                                <span>{t(item.titleKey)}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                ))}
            </CommandList>
        </CommandDialog>
    );
}
