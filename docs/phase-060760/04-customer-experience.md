# Phase 4 — Customer Experience Enhancements

Move wishlist and address data to the server, improve guest order recovery, and give admins visibility into newsletter subscribers.

**Priority:** P1  
**Estimated effort:** 5–7 days  
**Status:** Done

**Depends on:** [Phase 1](./01-ux-storefront-settings.md) (settings shell for address management UI)

---

## Goal

Logged-in customers retain wishlist and shipping addresses across devices. Guests can look up orders after session loss. Marketing can export newsletter subscribers from admin.

---

## Prerequisites

- [x] Phase 1 complete (or at minimum storefront settings layout ready for new "Addresses" nav item)
- [x] Server cart (Phase 7 post-MVP) already live

---

## Scope checklist

### 4.1 Server-side wishlist

#### Database

- [x] Migration: `wishlists` table (`user_id` FK unique, timestamps)
- [x] Migration: `wishlist_items` (`wishlist_id`, `product_id`, unique per product, timestamps)
- [x] Eloquent models + relationships on `User`, `Product`

#### Backend

- [x] `WishlistService`: add, remove, list, merge guest items (no separate "toggle" method — the REST split is `add`/`remove`; the client decides which to call based on current state, matching the `POST`=add/`DELETE`=remove route design below)
- [x] API routes under `/api/wishlist` (or web JSON endpoints with session):
  - `GET /api/wishlist`
  - `POST /api/wishlist/items` (body: `productSlug` or `productId`)
  - `DELETE /api/wishlist/items/{product}`
- [x] On login: merge localStorage slugs into server wishlist (Inertia shared prop or dedicated endpoint)
- [x] Guest: continue localStorage fallback until login

#### Frontend

- [x] Refactor [`wishlist-context.tsx`](../../resources/js/contexts/wishlist-context.tsx) to sync with API when authenticated
- [x] `ProductCard.tsx` / `wishlist-button.tsx` needed **no changes** — they only call the context's `toggleItem`/`isWishlisted`, and the context now transparently swaps between local and server-backed implementations based on auth state
- [x] Update [`wishlist.tsx`](../../resources/js/pages/storefront/wishlist.tsx) to hydrate from server props + API
- [x] Toast messages unchanged (i18n exists)

#### Tests

- [x] Feature: authenticated user add/remove wishlist item
- [x] Guest uses localStorage only (no API writes) — verified via real browser (Playwright), not a Pest test, since this is purely client-side hook behavior; no JS unit test runner exists in this repo
- [x] Feature: merge on login (local items + server items deduplicated)

---

### 4.2 Saved shipping addresses

#### Database

- [x] Migration: `shipping_addresses` table:
  - `user_id`, `label` (optional, e.g. "Home"), `recipient_name`, `phone`, `address_line`, `is_default` boolean
  - Soft limits: max 10 per user (validate in form request)

#### Backend

- [x] `ShippingAddressController` in `Settings` or `Storefront` namespace
- [x] Routes (auth required):
  - `GET /settings/addresses` — list
  - `POST /settings/addresses` — create
  - `PATCH /settings/addresses/{id}` — update
  - `DELETE /settings/addresses/{id}` — delete
  - `PATCH /settings/addresses/{id}/default` — set default
- [x] Policy: user can only manage own addresses

#### Frontend

- [x] Page `storefront/settings/addresses.tsx` + CRUD forms (storefront design)
- [x] Add "Addresses" to [`settings-nav.tsx`](../../resources/js/components/storefront/settings/settings-nav.tsx)
- [x] Checkout [`checkout.tsx`](../../resources/js/pages/storefront/checkout.tsx):
  - Dropdown to pick saved address (authenticated)
  - "Save this address" checkbox on submit
- [x] Pre-fill from default address on checkout load

#### Tests

- [x] CRUD feature tests for shipping addresses
- [x] Checkout uses selected address snapshot on order (denormalized into `orders.shipping_address` JSON — do not FK live address into historical orders)

---

### 4.3 Guest order lookup

#### Backend

- [x] Route `GET /orders/lookup` — form page (guest + auth)
- [x] Route `POST /orders/lookup` — validate `order_number` + `customer_email` (or phone) against order
- [x] On success: redirect to `orders.confirmation` or `orders.show` with one-time token or session grant (extend `guest_order_access` pattern)
- [x] Rate limit: `throttle:5,1` on POST
- [x] Do not leak whether order exists vs email mismatch (generic error message)

#### Frontend

- [x] Page `storefront/orders/lookup.tsx` linked from:
  - Order confirmation page ("Lost your link?")
  - Footer or help section
- [x] i18n strings `orders.lookup.*`

#### Tests

- [x] Valid lookup grants view access
- [x] Invalid combo fails generically without revealing which field failed — implemented as the standard Inertia web-form flow (redirect back + flashed session error on `orderNumber`), not a raw 422 JSON response, since this is an Inertia page form, not an API endpoint
- [x] Throttle enforced

---

### 4.4 Newsletter admin

#### Backend

- [x] `Admin\NewsletterSubscriberController@index` — paginated list, filter by source
- [x] `GET /admin/newsletter-subscribers/export` — CSV download (email, source, subscribed_at)
- [x] Read-only (no create from admin — subscribers come from storefront form)

#### Frontend

- [x] Admin page `admin/newsletter-subscribers/index.tsx`
- [x] Sidebar link in admin layout
- [x] i18n `admin.newsletter.*`

#### Tests

- [x] Admin can list subscribers
- [x] Customer cannot access admin routes
- [x] Export returns CSV with correct headers

---

## Key files

| Area | Path |
|------|------|
| Wishlist | `app/Services/Wishlist/`, `app/Models/Wishlist*.php` |
| Addresses | `app/Models/ShippingAddress.php`, `app/Http/Controllers/Settings/ShippingAddressController.php` |
| Guest lookup | `app/Http/Controllers/Storefront/OrderLookupController.php` |
| Newsletter admin | `app/Http/Controllers/Admin/NewsletterSubscriberController.php` |
| Frontend | `resources/js/pages/storefront/settings/addresses.tsx`, `storefront/orders/lookup.tsx` |

---

## Acceptance criteria

1. Wishlist persists for logged-in user across browser sessions.
2. Checkout pre-fills default saved address; order snapshot remains immutable.
3. Guest can recover order view with order number + email without prior session.
4. Admin can export newsletter CSV.

---

## Verification

```bash
php artisan test --filter=Wishlist
php artisan test --filter=ShippingAddress
php artisan test --filter=OrderLookup
php artisan test --filter=Newsletter
composer ci:check
```

---

## Out of scope

- Email marketing campaigns / Mailchimp sync
- Wishlist share links
- Multiple shipping addresses per checkout (single selection only)

---

## Progress log

| Date | Task | Notes |
|------|------|-------|
| 2026-07-07 | 4.4 | Newsletter admin: `NewsletterSubscriberController` (index + CSV export), admin nav/i18n, 4 tests. |
| 2026-07-07 | 4.3 | Guest order lookup: `OrderLookupController`, throttled route, links from confirmation page + footer, 4 tests covering success/mismatch/not-found/throttle. |
| 2026-07-07 | 4.2 | Saved shipping addresses: migration, model, policy, `ShippingAddressController` (CRUD + set-default, 10-address soft limit), storefront settings page with add/edit/delete dialogs, checkout integration (saved-address picker + "save this address" checkbox), 10 backend tests. **Discovered a pre-existing UI bug** (not introduced by this phase): `components/ui/dialog.tsx`'s `DialogContent` renders at ~50px width instead of the intended centered modal — reproduced identically on the already-shipped `delete-account-section.tsx` dialog. Root cause narrowed to Tailwind v4 not resolving `w-[min(calc(100vw-2rem),32rem)]` / `-translate-x-1/2` on this element; not fixed here (shared primitive, needs dedicated investigation) — flagged for follow-up. |
| 2026-07-07 | 4.1 | Server-side wishlist: `wishlists`/`wishlist_items` tables, `WishlistService`, `/api/wishlist` endpoints, `wishlist-context.tsx` transparently switches between localStorage (guest) and server (authenticated) with merge-on-first-authenticated-load: 7 backend tests + full browser verification (guest add → login → merge → persisted remove → reload). **Found and fixed a real bug** in `bootstrap/app.php`'s API exception renderer: it classified status by `$exception instanceof HttpExceptionInterface`, but `AuthenticationException`/`AuthorizationException` don't implement that interface, so *every* unauthenticated/unauthorized request to any `api/*` route returned `500` instead of `401`/`403`. Never surfaced before because no existing `api/*` route required auth prior to this phase. Fixed via an explicit `match` on both exception types; full suite (358 tests) still green afterward. |
