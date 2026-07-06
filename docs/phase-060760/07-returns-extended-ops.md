# Phase 7 — Returns & Extended Ops

Implement return merchandise authorization (RMA) workflow and operational features deferred from earlier phases. **Optional for initial production launch** — prioritize if return policy promises online returns.

**Priority:** P2/P3  
**Estimated effort:** 5–8 days  
**Status:** Done

**Depends on:** [Phase 5](./05-payment-inventory-ops.md) (refund infrastructure reusable for return refunds)

---

## Goal

Customers can request returns within policy windows. Admins approve or reject, track return shipping, and restock inventory. Stripe refunds tie into approved returns when applicable.

---

## Prerequisites

- [x] Business rules signed off: return window (e.g. 30 days), eligible statuses (`delivered`, `completed`), non-returnable categories
- [x] Phase 5 Stripe refund service available
- [x] Legal page [`/returns`](../../routes/web.php) updated to match actual workflow

---

## Scope checklist

### 7.1 Return policy configuration

- [x] Add `site_settings` keys or dedicated config:
  - `returns_window_days` (default 30)
  - `returns_enabled` boolean
- [x] Admin toggle in store settings [`StoreSettingController`](../../app/Http/Controllers/Admin/StoreSettingController.php)

---

### 7.2 Database

- [x] Migration: `return_requests` table:
  - `id`, `order_id`, `user_id`, `status` enum (`pending`, `approved`, `rejected`, `received`, `refunded`, `closed`)
  - `reason` text, `admin_notes` text nullable
  - `requested_at`, `resolved_at` nullable
- [x] Migration: `return_request_items` table:
  - `return_request_id`, `order_item_id`, `quantity`, `condition` optional
- [x] Link to order snapshots (do not FK live product variant for historical integrity)

---

### 7.3 Customer-facing flow

- [x] Route `GET /orders/{orderNumber}/returns` — eligibility check (within window, correct status)
- [x] Route `POST /orders/{orderNumber}/returns` — create return request with selected line items + reason
- [x] Page `storefront/orders/return-request.tsx`
- [x] Link from [`orders/show.tsx`](../../resources/js/pages/storefront/orders/show.tsx) when eligible
- [x] Email notification to customer on status changes (reuse queued mail from Phase 3)
- [x] i18n `orders.returns.*`

---

### 7.4 Admin flow

- [x] `Admin\ReturnRequestController`:
  - Index (filter by status)
  - Show detail
  - Patch status: approve → received → refunded → closed
  - Reject with reason
- [x] Admin pages `admin/return-requests/{index,show}.tsx`
- [x] Sidebar navigation entry
- [x] On `received`: optional restock via [`OrderStatusService`](../../app/Services/Order/OrderStatusService.php) inventory pattern (increment `quantity`)
- [x] On `refunded` for Stripe orders: call `StripeRefundService` (full or partial per line)

---

### 7.5 Notifications

- [x] `ReturnRequestSubmittedMail` → admin
- [x] `ReturnRequestStatusMail` → customer
- [x] Both implement `ShouldQueue`

---

### 7.6 Tests

- [x] Customer can request return for eligible order
- [x] Customer cannot request outside window
- [x] Admin approve → received restocks inventory
- [x] Admin refund triggers Stripe mock (Stripe orders only)
- [x] Permission: cannot request return for another user's order

---

### 7.7 Extended ops (optional sub-tasks)

Pick based on business need — not required to mark phase complete:

- [x] **7.7a** Shipment tracking number field on orders (`tracking_number`, carrier)
- [x] **7.7b** Customer-facing tracking page
- [x] **7.7c** Admin bulk status update for orders
- [x] **7.7d** Export return requests CSV

---

## Key files

| Layer | Path |
|-------|------|
| Models | `app/Models/ReturnRequest.php`, `ReturnRequestItem.php` |
| Services | `app/Services/Order/ReturnRequestService.php` |
| Controllers | `app/Http/Controllers/Storefront/ReturnRequestController.php`, `Admin/ReturnRequestController.php` |
| Mail | `app/Mail/ReturnRequest*.php` |
| Frontend | `resources/js/pages/storefront/orders/return-request.tsx`, `admin/return-requests/` |

---

## Acceptance criteria

1. End-to-end return: customer request → admin approve → mark received → refund (if Stripe) → closed.
2. Inventory restocked correctly on received items.
3. Ineligible orders show clear message (no silent failure).
4. Return policy on `/returns` legal page matches system behavior.

---

## Verification

```bash
php artisan test --filter=ReturnRequest
composer ci:check
```

Manual QA:

- [ ] COD order return: manual refund note (no Stripe call)
- [ ] Stripe order return: refund in Stripe test dashboard
- [ ] Email notifications received for each status transition

---

## Deferral criteria

Mark phase **Deferred** in [overview](./00-overview.md) if:

- Launch is COD-only with in-person returns
- Return volume expected near zero in first 90 days

If deferred, still complete:

- [ ] Update `/returns` legal page to describe manual process (email/phone)
- [ ] Add note in overview progress log with reason and target date

---

## Progress log

| Date | Task | Notes |
|------|------|-------|
| 2026-07-07 | Phase 7 implementation | RMA workflow, admin UI, tests (7), legal copy, CSV export |
| 2026-07-07 | Phase 7.7 extended ops | Tracking fields, customer track page, bulk order status, docs |
