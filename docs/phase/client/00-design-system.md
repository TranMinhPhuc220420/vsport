# Phase 1 — Design System & Layout

Apply the Nike-style design system from [DESIGN.md](../../DESIGN.md) to the VSport frontend.

## Scope

| Item | Status |
|------|--------|
| Design tokens: colors, 8px spacing, border-radius | Done |
| Typography: Inter / Bebas Neue | Done |
| Core components: Button, Badge, ProductCard, FilterChip, SearchPill | Done |
| Storefront layout: UtilityBar, PrimaryNav, Footer | Done |
| Responsive layout: mobile drawer, PLP/PDP breakpoints | Done |
| Admin layout (sidebar) | Done |

## Design tokens

Defined in [`resources/css/app.css`](../../../resources/css/app.css) via Tailwind v4 `@theme`:

- **Colors:** `ink`, `canvas`, `soft-cloud`, `mute`, `sale`, `success`, etc.
- **Spacing:** `xxs` through `section` (8px base)
- **Radius:** `pill-sm`, `pill-md`, `pill-lg`, `full`
- **Breakpoints:** `tablet`, `tablet-lg`, `desktop`, `desktop-lg`, `wide`, `ultrawide`

Utility classes: `.storefront-container`, `.storefront-grid`, `.storefront-section`, `.vsport-light`.

## Typography

Fonts loaded in [`vite.config.ts`](../../../vite.config.ts):

- **Inter** — UI text (400, 500, 600)
- **Bebas Neue** — display campaign headlines

Utility classes: `.text-display-campaign`, `.text-heading-xl`, `.text-body-strong`, `.text-caption-md`, etc.

## Storefront components

Namespace: [`resources/js/components/storefront/`](../../../resources/js/components/storefront/)

| Component | File | Notes |
|-----------|------|-------|
| Button | `Button.tsx` | Variants: `primary`, `secondary`, `outline-on-image`, `icon` |
| Badge | `Badge.tsx` | Variants: `promo`, `sale` |
| FilterChip | `FilterChip.tsx` | Toggle chip with active state |
| SearchPill | `SearchPill.tsx` | Search input with focus ring |
| ProductCard | `ProductCard.tsx` | Presentational; mock props for now |

Layout pieces: `utility-bar.tsx`, `primary-nav.tsx`, `mobile-nav-drawer.tsx`, `footer.tsx`.

Shell: [`resources/js/layouts/storefront/storefront-layout.tsx`](../../../resources/js/layouts/storefront/storefront-layout.tsx)

## Admin layout

Namespace: [`resources/js/components/admin/`](../../../resources/js/components/admin/)

- Nike-styled sidebar (soft-cloud surface, ink text)
- Dashboard link active; Products / Orders / Users disabled (Phase 5)
- Shell: [`resources/js/layouts/admin/admin-layout.tsx`](../../../resources/js/layouts/admin/admin-layout.tsx)

Wired in [`resources/js/app.tsx`](../../../resources/js/app.tsx) for `admin/*` pages.

## Layout routing

| Page prefix | Layout |
|-------------|--------|
| `preview/*` | StorefrontLayout |
| `admin/*` | AdminLayout |
| `auth/*` | AuthLayout (unchanged) |
| `settings/*` | AppLayout + SettingsLayout (unchanged) |
| default | AppLayout (customer dashboard) |

Storefront and admin shells use `.vsport-light` (light-only, no dark mode).

## Preview page

Internal styleguide at **`/preview/design-system`**:

- Color swatches
- Typography scale
- Button, badge, chip, search variants
- Product card grid (mock data)
- PDP two-column layout preview

## Verification

```bash
npm run types:check
npm run build
php artisan test --filter=DesignSystemPreview
```

Manual:

1. Visit `/preview/design-system` — full storefront chrome + components
2. Resize 320px–1440px — hamburger drawer, search collapse, grid columns
3. Log in as admin → `/admin` — Nike admin sidebar (not Laravel starter)

## Out of scope

- Real home / PLP / PDP pages (Phase 3)
- Catalog APIs (Phase 2)
- Auth/settings Nike re-skin
- Dark mode on storefront/admin
- Full PLP filter sidebar (Phase 3)
