export const adminInputClassName =
    'flex h-9 w-full rounded-admin-md border border-admin bg-[var(--admin-surface)] px-3 py-1 admin-body text-[var(--admin-primary)] outline-none transition-colors placeholder:text-[color-mix(in_srgb,var(--admin-secondary)_60%,transparent)] focus-visible:border-[var(--admin-tertiary)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--admin-tertiary)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-50';

export const adminTextareaClassName =
    'flex min-h-[80px] w-full rounded-admin-md border border-admin bg-[var(--admin-surface)] px-3 py-2 admin-body text-[var(--admin-primary)] outline-none transition-colors placeholder:text-[color-mix(in_srgb,var(--admin-secondary)_60%,transparent)] focus-visible:border-[var(--admin-tertiary)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--admin-tertiary)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-50';

/** Native `<select>` — used only for inline bulk-action menus. */
export const adminSelectClassName =
    'block h-9 w-full min-w-[12rem] cursor-pointer appearance-auto rounded-admin-md border border-admin bg-white px-3 py-1.5 text-sm leading-normal text-[#1a1a1a] outline-none transition-colors focus-visible:border-[var(--admin-tertiary)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--admin-tertiary)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1c1d1f] dark:text-[#f4f5f6]';

/** Radix Select trigger — mirrors language-switcher layout with admin field chrome. */
export const adminSelectTriggerClassName =
    'border-admin h-9 w-full min-w-[12rem] gap-2 rounded-admin-md border bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-primary)] shadow-none focus-visible:border-[var(--admin-tertiary)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--admin-tertiary)_25%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:size-4 [&>svg]:opacity-50';
