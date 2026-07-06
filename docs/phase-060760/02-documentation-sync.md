# Phase 2 — Documentation Sync

Align core documentation with the implemented codebase (Phase 7 complete). Outdated docs cause onboarding friction and incorrect architectural decisions.

**Priority:** P0  
**Estimated effort:** 1–2 days  
**Status:** Done

---

## Goal

A new developer reading `docs/BUSINESS_LOGIC.md`, `docs/DB_SCHEMA.md`, and `docs/PERMISSIONS.md` gets an accurate picture of server cart, Stripe, reviews, analytics, and Laravel-native auth — not the original MVP assumptions.

---

## Prerequisites

- [x] None (can run in parallel with Phase 1)

---

## Scope checklist

### 2.1 BUSINESS_LOGIC.md

- [x] Update §1 Overview: COD **and** Stripe; server-side cart with reservation
- [x] Replace §4 Cart Logic:
  - Remove "client-based localStorage MVP"
  - Document `carts`, `cart_items`, `CartService`, hourly `carts:release-expired`
  - Document checkout reads server cart (authenticated user)
- [x] Update §5 Checkout: payment method selection (`cod` | `stripe`), guest checkout with email required
- [x] Update §6 Order Lifecycle: note stock rules (confirm deducts quantity + reserved; cancel pending releases reservation) — cross-ref [post-mvp doc](../phase/post-mvp/01-extensions.md)
- [x] Update §8 Inventory: `quantity` vs `reserved_quantity` table
- [x] Replace §11 Future Extensions: mark discount codes, reviews, Stripe, sustainability, Nike By You, analytics as **implemented**; list actual future items (RMA, saved addresses, etc. — link to this roadmap)
- [x] Add cross-links to [Phase 7 extensions](../phase/post-mvp/01-extensions.md)

### 2.2 DB_SCHEMA.md

- [x] Update §1.1 MVP vs Full Schema table — mark all post-MVP rows as implemented
- [x] Remove or archive "MVP (current)" column misleading entries
- [x] Add tables if missing from doc: `carts`, `cart_items`, `discount_codes`, `product_reviews`, `nike_by_you_options`, `product_sustainability_materials`, analytics `dim_*` / `fact_sales`, `blog_*`, `newsletter_subscribers`, `brands`, `size_guides`, `site_settings`
- [x] Fix auth row: Laravel `users` table (not Supabase Auth)
- [x] Document `orders.payment_method`, `orders.discount_code_id`, `orders.discount_amount`
- [x] Document `cart_items.custom_configuration` JSON for Nike By You

### 2.3 PERMISSIONS.md

- [x] Remove §2 Supabase RLS Policies (or move to archived appendix with "not applicable" note)
- [x] Replace with Laravel enforcement map:
  - Middleware: `auth`, `verified`, `admin`
  - Policies: `OrderPolicy`
  - Route groups in `routes/web.php`, `routes/admin.php`, `routes/settings.php`
- [x] Document guest checkout permissions (can checkout with email; cannot access `/orders` list without auth)
- [x] Document guest order view via session `guest_order_access`
- [x] Link to [`PermissionMatrixTest.php`](../../tests/Feature/Permissions/PermissionMatrixTest.php)

### 2.4 README.md roadmap section

- [x] Add subsection under "Current status" pointing to [phase-060760 overview](./00-overview.md)
- [x] Do not duplicate full checklist — link only

### 2.5 DEPLOYMENT.md (minor)

- [x] Verify queue worker documented if Phase 3 adds queued mail (add note: "required after Phase 3")
- [x] Confirm Stripe webhook steps match [`StripeWebhookController`](../../app/Http/Controllers/StripeWebhookController.php)

### 2.6 Consistency review

- [x] Grep docs for "localStorage", "COD only", "Supabase Auth", "not implemented" — fix or justify each hit
- [x] Ensure all doc links resolve (no broken relative paths)

---

## Key files

| File | Action |
|------|--------|
| [docs/BUSINESS_LOGIC.md](../BUSINESS_LOGIC.md) | Major rewrite |
| [docs/DB_SCHEMA.md](../DB_SCHEMA.md) | Major update |
| [docs/PERMISSIONS.md](../PERMISSIONS.md) | Replace RLS section |
| [README.md](../../README.md) | Add roadmap link |
| [docs/DEPLOYMENT.md](../DEPLOYMENT.md) | Minor updates |

---

## Acceptance criteria

1. No core doc claims cart is client-only or payment is COD-only.
2. Permission model described in Laravel terms with test reference.
3. Schema doc lists all production tables from `database/migrations/`.
4. Second reviewer (or self-review after 24h) finds no contradictions with code.

---

## Verification

```bash
# Search for stale terminology (expect zero hits in docs/ after completion)
rg -i "localStorage|COD only|Supabase Auth|not implemented" docs/ --glob '*.md'
```

Manual:

- [x] Read BUSINESS_LOGIC cart + checkout sections against `CartService` and `OrderCheckoutService`
- [x] Compare DB_SCHEMA table list to `php artisan migrate:status`

---

## Out of scope

- Vietnamese translations of docs
- API OpenAPI/Swagger generation

---

## Progress log

| Date | Task | Notes |
|------|------|-------|
| 2026-07-06 | 2.1–2.6 | Rewrote BUSINESS_LOGIC.md, DB_SCHEMA.md, PERMISSIONS.md against actual migrations/services (found the catalog is now option-based, not colorway-based — `product_colorways` was dropped and replaced by `product_options`/`product_option_values`/`variant_option_values`; docs updated accordingly). DEPLOYMENT.md: added forward note that a queue worker becomes required once Phase 3 queues order mail; confirmed Stripe webhook steps already match `StripeWebhookController`. README.md roadmap link was already done in prior work this cycle. Consistency grep + link-resolution check passed on all core docs. |
