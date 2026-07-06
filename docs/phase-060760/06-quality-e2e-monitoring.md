# Phase 6 — Quality, E2E & Monitoring

Close automated test gaps, add browser-level smoke tests for critical revenue paths, and enable production error monitoring.

**Priority:** P2  
**Estimated effort:** 4–6 days  
**Status:** Done

**Depends on:** [Phase 2](./02-documentation-sync.md), [Phase 3](./03-ci-ops-hardening.md)  
**Can partially overlap with:** [Phase 4](./04-customer-experience.md)

---

## Goal

Critical user journeys are covered by E2E tests in CI. Feature test holes for newer modules are filled. Production errors surface in Sentry (or equivalent) with actionable context.

---

## Prerequisites

- [x] Phase 3 CI pipeline stable (`composer ci:check` green on `main`)
- [x] Staging or local environment with seeded catalog for E2E

---

## Scope checklist

### 6.1 Feature test gaps

#### Size guides

- [x] Admin CRUD: create size guide, sync rows, attach image
- [x] Storefront PDP: size guide disclosure renders when product/category linked
- [x] Files: [`SizeGuideController`](../../app/Http/Controllers/Admin/SizeGuideController.php), [`size-guide-disclosure.tsx`](../../resources/js/components/storefront/size-guide-disclosure.tsx)

#### Brands

- [x] Admin brand CRUD
- [x] Product assigned to brand appears in admin edit form
- [x] PLP/PDP exposes brand name via `brandName` on catalog resources

#### Homepage CMS

- [x] Covered by existing [`BlockBAdminTest.php`](../../tests/Feature/Admin/BlockBAdminTest.php) (admin update + storefront props)
- [x] No duplicate `HomepageCmsTest` — reuse Block B tests

#### Wishlist (after Phase 4)

- [x] Covered in [`WishlistTest.php`](../../tests/Feature/Api/WishlistTest.php)

#### Block/regression tests

- [x] [`BlockCTest.php`](../../tests/Feature/Admin/BlockCTest.php) extended for order lookup + newsletter admin routes

---

### 6.2 E2E test framework

#### Setup

- [x] **Playwright** in `e2e/` + [`playwright.config.ts`](../../playwright.config.ts)
- [x] `npm run e2e` (local), `npm run e2e:ci` (headless)
- [x] CI `e2e` job in [`.github/workflows/deploy.yml`](../../.github/workflows/deploy.yml)
- [x] Documented in [`e2e/README.md`](../../e2e/README.md) and [DEPLOYMENT.md](../DEPLOYMENT.md)

#### Smoke scenarios (minimum)

- [x] **E2E-1:** Guest PLP → PDP → add to bag → cart (`e2e/browse-pdp-cart.spec.ts`)
- [x] **E2E-2:** Authenticated COD checkout (`e2e/checkout-cod.spec.ts`)
- [x] **E2E-3:** Admin confirm order (`e2e/admin-order.spec.ts`)
- [ ] **E2E-4:** Stripe checkout — deferred (manual / staging with test keys)

#### Stability

- [x] `data-testid` on add-to-bag, checkout-submit, login-submit, admin-order-confirm
- [x] [`E2eSeeder`](../../database/seeders/E2eSeeder.php) + catalog seeder (`zegama-2` in stock)

---

### 6.3 Sentry / error monitoring

- [x] `sentry/sentry-laravel` installed; [`config/sentry.php`](../../config/sentry.php)
- [x] `SENTRY_LARAVEL_DSN` in `.env.example`
- [x] Empty DSN disables reporting (local/CI safe)
- [x] PII scrubbing via [`SentryEventScrubber`](../../app/Support/SentryEventScrubber.php)
- [ ] Manual: verify test event in Sentry project after setting DSN on staging
- [x] Documented in [DEPLOYMENT.md](../DEPLOYMENT.md)

---

### 6.4 Performance baselines (lightweight)

- [x] Documented in [performance-baselines.md](./performance-baselines.md)
- [ ] Lighthouse CI on PR — deferred
- [x] `public/build/manifest.json` checked by deploy-check (existing)

---

### 6.5 Accessibility spot-check

- [x] Documented in [accessibility-audit.md](./accessibility-audit.md)
- [x] No critical blockers found on home, PDP, checkout, settings
- [x] Known acceptable warnings recorded

---

## Key files

| Area | Path |
|------|------|
| Feature tests | `tests/Feature/Admin/SizeGuideCrudTest.php`, `BrandCrudTest.php`, `Storefront/SizeGuideDisclosureTest.php` |
| E2E | `e2e/*.spec.ts`, `playwright.config.ts` |
| CI | `.github/workflows/deploy.yml` |
| Monitoring | `config/sentry.php`, `app/Support/SentryEventScrubber.php` |

---

## Acceptance criteria

1. New feature tests pass for size guides, brands, homepage CMS (Block B).
2. Three E2E smoke tests run in CI `e2e` job.
3. Sentry ready when DSN set; scrubber tested in Pest.
4. No regression in Pest suite.

---

## Verification

```bash
composer ci:check
npm run e2e:ci   # requires seeded DB + php artisan serve
php artisan test --filter=SizeGuide
php artisan test --filter=BrandCrud
php artisan test --filter=SentryConfiguration
```

---

## Progress log

| Date | Task | Notes |
|------|------|-------|
| 2026-07-07 | Phase 6 complete | Playwright E2E, Sentry, feature tests, docs |
