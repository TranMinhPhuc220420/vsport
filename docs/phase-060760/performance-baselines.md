# Performance baselines (Phase 6)

Lightweight targets for storefront Core Web Vitals. Full lazy-load rules are documented in [Phase 6 polish](../phase/client/04-polish-quality.md).

## Targets

| Page | Metric | Target | Notes |
|------|--------|--------|-------|
| Home (`/`) | LCP | < 2.5s | Campaign hero uses `loading="eager"`; below-fold tiles lazy-load |
| PDP (`/products/{slug}`) | LCP | < 2.5s | Main gallery image eager; thumbnails lazy |
| PLP (`/{category}`) | LCP | < 2.8s | `ProductCard` images lazy; paginate max 48 |
| Cart / Checkout | INP | < 200ms | Server cart API; avoid blocking mail in request path (queued) |

## Build artifact

Production deploy check validates `public/build/manifest.json` exists (`php artisan vsport:deploy-check --strict`).

## Verification (manual)

```bash
npm run build
# Lighthouse in Chrome DevTools — Mobile, throttled
# Home, PDP (e.g. /products/zegama-2), /checkout
```

Lighthouse CI on every PR is **deferred** — run manually before major storefront releases.
