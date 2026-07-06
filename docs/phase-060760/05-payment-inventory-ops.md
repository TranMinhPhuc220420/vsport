# Phase 5 — Payment & Inventory Ops

Handle Stripe refunds on cancelled paid orders and alert admins when inventory runs low.

**Priority:** P1  
**Estimated effort:** 3–4 days  
**Status:** Done

**Depends on:** [Phase 3](./03-ci-ops-hardening.md) (queued mail for alert notifications)

---

## Goal

Cancelling a Stripe-paid order triggers an automatic refund (or manual admin action with audit log). Admins are notified before products sell out unexpectedly.

---

## Prerequisites

- [x] Phase 3 complete (queue available for alert emails)
- [ ] Stripe configured in staging (`STRIPE_*` env vars) — not verifiable from this environment (no staging access); code works with any valid keys, tested here with mocks + a deliberately-invalid key
- [x] [`StripeCheckoutService`](../../app/Services/Payment/StripeCheckoutService.php) and webhook flow working

---

## Scope checklist

### 5.1 Stripe refund on order cancel

#### Business rules (define before coding)

- [x] Documented in [BUSINESS_LOGIC.md §6](../BUSINESS_LOGIC.md#6-order-lifecycle): a refund is only attempted when cancelling FROM `confirmed`/`shipping`/`delivered` (i.e. exactly where `shouldRestoreStock()` already fires) — cancelling from `pending` never deducted stock and never triggers a refund, regardless of payment method. This sidesteps the "authorized but not captured" ambiguity entirely: by the time stock has been deducted (an admin confirmed the order), the Stripe payment is assumed captured.
  - Partial refunds — out of scope (a refund is always the full `total_amount` via the PaymentIntent)

#### Backend

- [x] Add `payment_intent_id` (or verify existing column on `orders`) accessible for refund
- [x] `StripeRefundService::refundOrder(Order $order): void`
  - Call `Stripe\Refund::create` or PaymentIntent cancel per Stripe API state
  - Store `refunded_at`, `refund_id` on order (migration if columns missing)
- [x] Integrate into [`OrderStatusService`](../../app/Services/Order/OrderStatusService.php) when transitioning to `cancelled` and payment was Stripe
- [x] Handle idempotency (do not double-refund)
- [x] Log admin activity in [`AdminActivityLog`](../../app/Models/AdminActivityLog.php)

#### Error handling

- [x] Chose: **allow the cancel to proceed** (order becomes `cancelled`, stock restored) but set `refund_status=failed` for manual retry via `PATCH /admin/orders/{orderNumber}/refund/retry` — blocking the cancel would leave stock in limbo (already deducted, order stuck un-cancellable) just because Stripe had a transient failure.
- [x] Admin UI shows refund status on order detail

#### Frontend

- [x] Admin order show: display payment method, PaymentIntent id (masked), refund status
- [x] Optional: "Retry refund" button for failed state

#### Tests

- [x] Mock `StripeRefundService`: cancelling a confirmed order attempts a refund (`tests/Feature/Admin/OrderRefundTest.php`)
- [x] Cancelling from `pending` never attempts a refund, regardless of payment method (matches the documented business rule — a more precise guarantee than "COD doesn't call Stripe", since a `pending` Stripe order doesn't either)
- [x] Idempotent: `StripeRefundServiceTest.php` (unit) calls the real service twice on an already-refunded order and asserts no change
- [x] New `tests/Unit/Services/StripeRefundServiceTest.php` + `tests/Feature/Admin/OrderRefundTest.php` (retry, ineligible retry, permission) — kept separate from `StripeCheckoutTest.php` since that file covers checkout-time Stripe, not cancel-time refunds

---

### 5.2 Low-stock alerts

#### Configuration

- [x] Chose the env var: `LOW_STOCK_THRESHOLD` (default 5) via `config('inventory.low_stock_threshold')` — also reused by the pre-existing admin dashboard low-stock widget (`DashboardController`), which previously hardcoded `5`

#### Backend

- [x] `LowStockAlertService` + command `inventory:check-low-stock`
  - Query variants where `quantity - reserved_quantity <= threshold`
  - Deduplicated via cache key `low_stock_alert:{variantId}`, 72h TTL (not 24h — a daily digest would otherwise re-email the same still-low SKU every single day; 72h gives ops a few days before a repeat nudge)
- [x] Mailable `LowStockAlertMail` (queued) to `site_settings.store_profile.contactEmail` (`StoreSettingsService`, already admin-editable — reused instead of adding a new `ADMIN_EMAIL`-based path)
- [x] Schedule: daily at 08:00, registered alongside `analytics:sync`, with its own `OpsHeartbeat` + `vsport:deploy-check` entry

#### Admin UI (minimal)

- [x] Dashboard widget already existed (`admin/dashboard.tsx` low-stock list, per-product) — updated its hardcoded threshold to read from the shared `inventory.low_stock_threshold` config instead of a magic `5`
- [ ] Link to filtered product inventory view — not added (optional, deferred)

#### Tests

- [x] Unit: SKUs at threshold included, above excluded
- [x] Feature: command sends mail when threshold breached ( `Mail::fake()` )

---

### 5.3 Order export enhancement (optional)

- [x] Include `payment_method`, `refund_status` in [`OrderExportService`](../../app/Services/Admin/OrderExportService.php) CSV

---

## Key files

| Layer | Path |
|-------|------|
| Stripe | `app/Services/Payment/StripeRefundService.php` |
| Orders | `app/Services/Order/OrderStatusService.php` |
| Inventory | `app/Console/Commands/CheckLowStockCommand.php` |
| Mail | `app/Mail/LowStockAlertMail.php` |
| Admin UI | `resources/js/pages/admin/orders/show.tsx` |
| Migrations | `database/migrations/*_add_refund_columns_to_orders*` |

---

## Acceptance criteria

1. Cancelling a Stripe-completed order results in refund recorded in DB and Stripe dashboard.
2. Failed refunds are visible to admin without silent failure.
3. Admin receives at most one low-stock digest per SKU per 24h (or per configured window).
4. All Stripe calls run server-side; no secret keys in frontend.

---

## Verification

```bash
php artisan test --filter=Stripe
php artisan test --filter=OrderLifecycle
php artisan test --filter=OrderRefund
php artisan test --filter=LowStock
composer ci:check
# Staging manual test with Stripe test mode
```

Stripe Dashboard (test mode):

- [ ] Place Stripe order → admin cancel → refund appears in Stripe → customer sees updated status email — **not run** (no real Stripe test-mode account in this environment). Instead verified in a real browser with a fake secret key that the failure path degrades correctly: cancel succeeds, `refund_status=failed`, retry button shows, retry attempt fails gracefully with a toast, no crash. See progress log.

---

## Out of scope

- Partial refunds / line-item refunds
- Multi-currency Stripe
- Automatic PO / supplier reorder

---

## Progress log

| Date | Task | Notes |
|------|------|-------|
| 2026-07-07 | 5.1 | `StripeRefundService` + `refund_id`/`refund_status`/`refunded_at` columns on `orders`. Refund attempted only when cancelling from `confirmed`/`shipping`/`delivered` (reuses `shouldRestoreStock()`); COD and `payment_intent_id`-less orders no-op inside the service; idempotent via `refund_id` guard. Admin retry route + UI (refund status + retry button on order detail). Verified in a real browser (not just mocks): cancelled a Stripe order with a deliberately-invalid secret key and confirmed the failure path — cancel still succeeds, `refund_status=failed`, retry button renders, retry itself fails gracefully with a toast, zero console/server errors. 8 new tests (3 unit + 5 feature). |
| 2026-07-07 | 5.2 | `LowStockAlertService` + `inventory:check-low-stock` (daily 08:00), `config('inventory.low_stock_threshold')` (env `LOW_STOCK_THRESHOLD`, default 5), cache-based per-SKU dedup (72h), queued `LowStockAlertMail` to the store's admin-editable contact email. Also fixed the *pre-existing* dashboard low-stock widget to use this same config instead of its hardcoded `5`. 6 new tests (3 unit + 1 feature + scheduler heartbeat + deploy-check integration). |
| 2026-07-07 | 5.3 | Added `refund_status` to the orders CSV export (`payment_method` was already exported). |
| 2026-07-07 | docs | Updated BUSINESS_LOGIC.md (§6 refund rule, §13/§14 — also caught that §13/§14 were still listing Phase 4 features as "not yet implemented" after Phase 4 shipped; fixed) and DB_SCHEMA.md (new `orders` refund columns, and a missing §4.8 for Phase 4's `wishlists`/`wishlist_items`/`shipping_addresses` tables that had never been documented). |
