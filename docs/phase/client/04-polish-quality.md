# Phase 6 — Polish & Quality

Hardening pass after Phase 5: structured API errors, permission test coverage, validation edge cases, category caching, storefront SEO, and image lazy-loading.

## Validation matrix

| Area | Enforcement |
|------|-------------|
| Checkout | [`CheckoutRequest`](../../app/Http/Requests/CheckoutRequest.php) |
| Admin catalog / orders / users | `App\Http\Requests\Admin\*` |
| Settings profile / password / 2FA | `App\Http\Requests\Settings\*` |
| API product listing | [`ProductIndexRequest`](../../app/Http/Requests/ProductIndexRequest.php) |
| Auth (login / register) | Fortify built-in rules + feature tests |
| Category hierarchy | [`ValidCategoryParent`](../../app/Rules/ValidCategoryParent.php) on category update |

Category updates reject assigning a parent that is the category itself or any of its descendants.

## API error shape

All `/api/*` JSON errors use:

```json
{
  "message": "Human-readable summary",
  "errors": { "field": ["Optional validation messages"] }
}
```

Implemented via [`ApiErrorResponse`](../../app/Support/ApiErrorResponse.php) and exception rendering in [`bootstrap/app.php`](../../bootstrap/app.php):

| Exception | Status |
|-----------|--------|
| `ValidationException` | 422 + `errors` |
| `NotFoundHttpException` (incl. missing models) | 404 |
| `CheckoutStockException` | 422 + item errors |
| `OrderConfirmStockException`, `InvalidOrderTransitionException` | 409 |
| Unexpected (production) | 500, message `Server error.` (no SQL leak) |

## Permissions (Laravel mapping)

[`tests/Feature/Permissions/PermissionMatrixTest.php`](../../tests/Feature/Permissions/PermissionMatrixTest.php) maps [PERMISSIONS.md](../../PERMISSIONS.md) to middleware + [`OrderPolicy`](../../app/Policies/OrderPolicy.php):

- Guests: redirected from checkout / orders
- Customers: cannot access admin; cannot view others' orders; cannot PATCH admin order status
- Admins: full catalog + order status control

## Category cache

| Key | TTL | Content |
|-----|-----|---------|
| `catalog.categories.tree` | 1 hour | Root category IDs (reloaded with children) |
| `catalog.categories.slug.{slug}` | 1 hour | Category ID by slug (reloaded with children) |

Only primitive IDs are stored in cache (not Eloquent models) so `database`/`file` drivers deserialize safely.

Invalidated by [`CatalogCache::forget()`](../../app/Support/CatalogCache.php) on admin category create / update / delete.

Used in [`ProductCatalogService`](../../app/Services/Catalog/ProductCatalogService.php) for home, PLP, and category-scoped product queries.

## SEO

[`PageSeo`](../../app/Data/PageSeo.php) DTO passed as `seo` prop from:

- [`HomeController`](../../app/Http/Controllers/Storefront/HomeController.php)
- [`ProductListingController`](../../app/Http/Controllers/Storefront/ProductListingController.php)
- [`ProductDetailController`](../../app/Http/Controllers/Storefront/ProductDetailController.php)

Rendered by [`page-seo.tsx`](../../resources/js/components/storefront/page-seo.tsx):

- `<title>`, `meta description`, `link canonical`
- Open Graph: `og:title`, `og:description`, `og:image` (PDP primary image)

Product slugs remain canonical URLs (`/products/{slug}`).

## Performance

- Pagination: PLP `per_page` max 48; admin lists paginated (unchanged from prior phases)
- **Lazy images:** gallery thumbnails, category tiles, cart line items, `ProductCard` (`loading="lazy"`)
- **Eager (LCP):** campaign hero, PDP main gallery image (`loading="eager"`)

## Tests added

```
tests/Feature/Api/ApiErrorResponseTest.php
tests/Feature/Permissions/PermissionMatrixTest.php
tests/Feature/Admin/OrderLifecycleTest.php
tests/Feature/Checkout/CheckoutValidationTest.php
tests/Feature/Catalog/CategoryCacheTest.php
tests/Feature/Storefront/SeoMetaTest.php
```

Plus validation edge cases in `CategoryCrudTest`, `AuthenticationTest`, `RegistrationTest`.

## Verification

```bash
php artisan test
npm run build
```
