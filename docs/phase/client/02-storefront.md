# Phase 3 — Storefront (Customer Pages)

Public Home, PLP, and PDP pages wired to the Phase 2 catalog backend via Inertia SSR.

## Scope

| Item | Status |
|------|--------|
| Home page: campaign hero, featured products, category tiles | Done |
| PLP: grid, filter sidebar, sort, pagination | Done |
| PDP: gallery, colorway picker, size picker, add to bag | Done |
| Stock status display | Done |
| Sale pricing styling (`#d30005`) | Done |

## Architecture

Storefront controllers reuse [`ProductCatalogService`](../../app/Services/Catalog/ProductCatalogService.php) and API Resources. No client-side fetch to `/api/products` on these pages.

```
GET /              → HomeController
GET /{category}    → ProductListingController  (men|women|kids|jordan)
GET /products/{slug} → ProductDetailController
```

## Pages

| Route | Inertia page | Props |
|-------|--------------|-------|
| `/` | `storefront/home` | `featuredProducts`, `categories`, `campaign` |
| `/men` (etc.) | `storefront/products/index` | `products`, `filters`, `categoryMeta`, `filterOptions` |
| `/products/{slug}` | `storefront/products/show` | `product` |

PLP query params: `gender`, `sort` (`newest`, `price_asc`, `price_desc`), `page`, `per_page`.

## Components

New storefront components in [`resources/js/components/storefront/`](../../resources/js/components/storefront/):

- `campaign-hero.tsx`, `category-tile.tsx`
- `filter-sidebar.tsx`, `plp-sub-nav.tsx`, `pagination.tsx`
- `product-gallery.tsx`, `colorway-picker.tsx`, `size-picker.tsx`
- `stock-status.tsx`, `add-to-bag-button.tsx`

Updated: `ProductCard` (`href` prop), `primary-nav` (category links).

Types: [`resources/js/types/catalog.ts`](../../resources/js/types/catalog.ts)

## Add to Bag

Phase 3 validates size + stock in the UI and shows a success toast. Cart persistence is deferred to Phase 4.

## Key files

| Layer | Path |
|-------|------|
| Controllers | `app/Http/Controllers/Storefront/*.php` |
| Routes | `routes/web.php` |
| Pages | `resources/js/pages/storefront/` |
| Swatch helper | `app/Support/ColorSwatch.php` |

## Verification

```bash
php artisan migrate
php artisan db:seed --class=CatalogSeeder
npm run build
php artisan test --filter=Storefront
```

Manual smoke:

- `/` — hero, featured row, category tiles
- `/men` — filters, sort, pagination, sale price on Zegama 2
- `/products/jordan-1-low` — US 12 out of stock
- `/products/zegama-2` — colorway/size pickers, Add to Bag toast
