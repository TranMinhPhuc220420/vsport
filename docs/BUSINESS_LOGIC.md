# BUSINESS_LOGIC.md

## 1. Overview

Zova Sport (VSport) is a Nike-style e-commerce platform for sports products, built on Laravel + Inertia (React).

Core principles:

* COD (Cash on Delivery) **and** Stripe card payments
* Server-side cart with per-SKU inventory reservation
* Guest checkout supported (email required, no account needed)
* Discount codes, product reviews, sustainability info, and Nike By You customization
* Admin-controlled order lifecycle with automatic stock accounting
* Daily analytics ETL into a star schema for reporting

This document describes the implemented system. See [docs/phase-060760/00-overview.md](./phase-060760/00-overview.md) for the post-release hardening roadmap and [docs/phase/post-mvp/01-extensions.md](./phase/post-mvp/01-extensions.md) for the extensions design history.

---

## 2. User Roles

* **Guest** (not logged in) — can browse, add to cart, and checkout with email
* **Customer** (`role = customer`) — guest capabilities plus order history, reviews, wishlist (client-side), account settings
* **Admin** (`role = admin`) — full back-office access under `/admin`

See [PERMISSIONS.md](./PERMISSIONS.md) for the full enforcement map.

---

## 3. Product Flow

### Product hierarchy

Catalog is option-based (not colorway-based): a `Product` has one or more `ProductOption`s (e.g. Color, Size), each with `ProductOptionValue`s. A `ProductVariant` is a sellable SKU defined by a combination of option values (`variant_option_values`), with its own price override, images (via `option_value_id`), and one-to-one `Inventory` row.

```
products
  ├── product_options (Color, Size, …)
  │     └── product_option_values (swatch hex, sale price override, sort order)
  ├── product_variants (SKU) ── variant_option_values ──> product_option_values
  │     └── inventory (1:1)
  ├── product_attributes (spec sheet, grouped key/value)
  ├── product_content_sections (rich editorial blocks + images)
  ├── nike_by_you_options (customizable components, if is_customizable)
  └── product_sustainability_materials (Move to Zero style breakdown)

category_option_templates → default option set applied when creating a product in a category
```

Effective price for a variant (`ProductVariant::unitPrice()`): `variant.sale_price`, else the first option value's `sale_price` (e.g. a colorway on promo), else `product.base_price + variant.additional_price`.

### Product Listing (PLP)

* Public access, filter by category/brand/size/price, pagination
* Category tree supports nesting (`categories.parent_id`)

### Product Detail (PDP)

* Images, price, stock status, size guide (if linked), reviews, sustainability materials, Nike By You customizer (if customizable)

---

## 4. Cart Logic

Cart is **server-side**, backed by `carts` / `cart_items` tables (`App\Services\Cart\CartService`).

* **Guest cart**: identified by a `cart_session_id` cookie (see `App\Support\CartSession`); a `carts` row is created with `session_id` set and `user_id` null.
* **Customer cart**: one row per `user_id` (`CartService::resolveUserCart` uses `firstOrCreate`).
* **Merge on login**: `CartService::mergeGuestCartIntoUser()` moves guest cart items into the user's cart, summing quantities for duplicate variants, and re-reserving/releasing stock accordingly.
* **Expiry & reservation release**: each cart has `expires_at`, refreshed to `now() + 24h` on every touch. The `carts:release-expired` scheduled command (hourly, see [DEPLOYMENT.md](./DEPLOYMENT.md)) calls `CartService::releaseExpiredCarts()`, which releases reserved inventory and deletes expired carts.
* **Reservation accounting**: adding/updating a cart item calls `InventoryReservationService::reserveDelta()`, which increments `inventory.reserved_quantity` inside a row lock (`lockForUpdate`) and throws `CheckoutStockException` if the delta exceeds `quantity - reserved_quantity`. Removing an item or expiring a cart calls `release()` to decrement the reservation.
* Cart items store an optional `custom_configuration` JSON snapshot (Nike By You selections).

---

## 5. Checkout Flow

Handled by `App\Http\Controllers\Storefront\CheckoutController` + `App\Services\Order\OrderCheckoutService`.

1. User (guest or authenticated) opens `/checkout`. Authenticated users get name/email/last-shipping-address prefilled from their most recent order.
2. User submits: name, phone, shipping address, email (required for guests), optional discount code, and `paymentMethod` (`cod` | `stripe`).
3. `OrderCheckoutService::createFromCart()` runs inside a DB transaction:
   * Locks the cart, re-validates stock per line (`available = quantity - reserved_quantity`), rejects with `CheckoutStockException` if insufficient.
   * Validates the discount code (`DiscountService::validate`) and computes the discount amount if provided.
   * Creates the `Order` with `status = pending`, a generated `order_number` (`VS-XXXXXXXX`), a JSON `shipping_address` snapshot (name/phone/address/email), and `payment_method`.
   * Creates immutable `order_items` (product name, options snapshot, custom configuration, quantity, unit price at time of purchase).
   * Clears the cart's line items but **keeps the existing reservation** — it is only released/deducted on the next status transition (see §6).
4. **COD**: order confirmation email is sent immediately (`OrderNotificationService::sendConfirmationIfCod`); redirect to `orders.confirmation`.
5. **Stripe**: a `PaymentIntent` is created (`StripeCheckoutService::createPaymentIntent`) and the client completes payment via Stripe Elements; on the `payment_intent.succeeded` webhook (`StripeWebhookController`), `StripeCheckoutService::handlePaymentSucceeded()` sends the confirmation email.
6. **Guest order access**: for guest checkouts, the new `order_number` is pushed into the `guest_order_access` session array, granting temporary view access to the confirmation/order-status page without an account (see [PERMISSIONS.md](./PERMISSIONS.md)).

---

## 6. Order Lifecycle

```
pending → confirmed → shipping → delivered → completed
   ↓          ↓           ↓           ↓
cancelled  cancelled   cancelled   cancelled
```

Transitions are enforced by `App\Services\Order\OrderStatusService` (a fixed allow-list per status — see `TRANSITIONS`); invalid transitions throw `InvalidOrderTransitionException`. Only admins can transition orders (`OrderPolicy::update`).

**Stock rules** (this is the part most likely to surprise a reader coming from the old MVP doc):

* Stock is **reserved**, not deducted, when an item is added to the cart and again when the order is created (reservation carries over from cart → order).
* Stock is **deducted** (`inventory.quantity -= qty`, reservation released) only when an order transitions `pending → confirmed` (`OrderStatusService::deductStockForOrder`). This re-checks physical quantity and throws `OrderConfirmStockException` if insufficient.
* Cancelling from `pending` releases the reservation only (`releaseReservationForOrder`) — quantity was never deducted.
* Cancelling from `confirmed`, `shipping`, or `delivered` **restores** the deducted quantity (`restoreStockForOrder`).
* A status-change email is sent on every transition (`OrderNotificationService::sendStatusUpdate`).

**Stripe refunds** (`App\Services\Payment\StripeRefundService`, called from `OrderStatusService::transition()`):

* A refund is only attempted when cancelling FROM `confirmed`, `shipping`, or `delivered` — i.e. exactly the states where stock had already been deducted (`shouldRestoreStock()`), which is also the point past which a Stripe payment is assumed captured. Cancelling from `pending` never deducted stock and never triggers a refund, regardless of payment method.
* COD orders and orders with no `payment_intent_id` are no-ops inside `StripeRefundService` — the check lives in the service, not the caller, so `OrderStatusService` always "attempts" a refund on a stock-restoring cancel and the service decides whether that's applicable.
* On success: `orders.refund_id` / `refund_status = 'refunded'` / `refunded_at` are set. On a Stripe API failure, the cancel still succeeds (order becomes `cancelled`, stock is restored) but `refund_status = 'failed'` — an admin can retry via `PATCH /admin/orders/{orderNumber}/refund/retry`, which is a no-op if the order isn't `cancelled` + Stripe + `refund_status = failed`.
* Idempotent: a second call with `refund_id` already set is a no-op — relevant for retry safety, not for double-cancelling (an already-`cancelled` order has no further transitions).
* Partial/line-item refunds are out of scope — a refund is always for the full `total_amount` via the PaymentIntent.

### Shipment tracking

Admins set `tracking_number` and `shipping_carrier` on an order (`PATCH /admin/orders/{orderNumber}/tracking`). Known carriers get an external tracking URL via `App\Support\OrderTrackingUrl`.

Customers see tracking on their order detail page when signed in. Guests use `/orders/track` (order number + email) — same session grant pattern as order lookup — to open `/orders/{orderNumber}/track`.

---

### Return requests (RMA)

`App\Services\Order\ReturnRequestService` handles customer-initiated returns for `delivered` / `completed` orders within a configurable window (`ReturnPolicySettingsService` in `site_settings.return_policy`: `returnsEnabled`, `returnsWindowDays`, default 30).

**Eligibility:** returns enabled, order status `delivered` or `completed`, within window (measured from `orders.created_at`), no other active return (`pending` / `approved` / `received` / `refunded`).

**Customer flow:** `GET/POST /orders/{orderNumber}/returns` (auth + `OrderPolicy::view`). Creates `return_requests` + `return_request_items` (line items reference `order_items` snapshots, not live variants).

**Admin flow:** `/admin/return-requests` — filter, CSV export, detail, status transitions:

```
pending → approved → received → refunded → closed
   ↓         ↓
rejected  rejected
```

* `received`: restocks returned quantities (`inventory.quantity += qty` per line item).
* `refunded`: calls `StripeRefundService::refundOrder()` for Stripe orders (full PaymentIntent refund, same idempotency rules as §6).
* `rejected`: requires `admin_notes`; sets `resolved_at`.
* Queued mail: `ReturnRequestSubmittedMail` → store contact email; `ReturnRequestStatusMail` → customer on each transition.

---

## 7. Admin Order Management

Admin (`/admin/orders`) can:

* View all orders (paginated, filterable), export CSV (`OrderExportService`), bulk status update, set shipment tracking
* View order detail, transition status (subject to the allow-list in §6)
* View/manage products, categories, brands, size guides, reviews, discount codes, blog, homepage CMS, newsletter subscribers (list + CSV export), return requests (list + CSV export), analytics dashboard, store settings
* All mutating admin actions are recorded in `admin_activity_logs` (`AdminActivityService`)

---

## 8. Inventory Logic

* Each `product_variants` row has a 1:1 `inventory` row: `quantity` (physical on hand) and `reserved_quantity` (held by open carts/orders).
* **Available stock** = `quantity - reserved_quantity` (`Inventory::availableQuantity()`).
* Reservation increments happen at add-to-cart time; deduction happens at order confirmation (§6). This two-stage model prevents overselling while an order is still `pending` without touching physical stock until an admin commits to it.
* Low-stock alerting runs via the `inventory:low-stock-alert` scheduled command ([Phase 5](./phase-060760/05-payment-inventory-ops.md)).

---

## 9. Discount Codes

`App\Services\Discount\DiscountService` validates, in order: code exists, `is_active`, `starts_at`/`expires_at` window, `max_uses` not reached, subtotal ≥ `min_order_amount`. Amount is `percent` (of subtotal) or `fixed`, capped at the subtotal. Applying a code increments `used_count` and is denormalized onto the order (`discount_code_id`, `discount_amount`) so historical orders remain accurate if the code is later edited or deleted.

---

## 10. Product Reviews

Customers can leave one review per product (`unique(user_id, product_id)`) after authentication (`products.reviews.store`, `auth`+`verified`). Reviews are created with `is_approved = false` and only appear on the PDP / count toward `products.average_rating` / `review_count` once approved by an admin (`/admin/reviews`).

---

## 11. Image Handling

* Product, category, blog, and size-guide images are uploaded to the `public` disk (`storage/app/public`) by default, or S3-compatible storage (Supabase Storage or any S3 provider) when `SUPABASE_STORAGE_*` / S3 env vars are configured — see [DEPLOYMENT.md](./DEPLOYMENT.md).
* Both a public `image_url` and a `storage_path` are stored so images can be re-derived or deleted from the configured disk.

---

## 12. Error Handling

* Invalid checkout (empty cart, insufficient stock, invalid discount) → `CheckoutStockException` / `InvalidDiscountCodeException`, form redirected back with errors
* Invalid order status transition → `InvalidOrderTransitionException`
* Insufficient stock at confirmation time → `OrderConfirmStockException`
* Unauthorized access → `403` (policy) or redirect to login (guest hitting an authenticated route)

---

## 13. Implemented Since MVP

The original MVP scope (COD-only, client-side cart) has been superseded. All of the following are implemented in the current codebase:

* Server-side cart with reservation (§4)
* Stripe card payments alongside COD (§5)
* Discount codes (§9)
* Product reviews & ratings (§10)
* Sustainability material breakdown per product
* Nike By You customization (`custom_configuration` snapshot on cart/order items)
* Analytics ETL (`analytics:sync`) into a star schema (`fact_sales`, `dim_*`) for admin reporting
* Blog / editorial content, homepage campaign CMS, brands, size guides, newsletter subscribers (with CSV export)
* Laravel-native auth (Fortify) with 2FA and passkeys — no Supabase Auth
* Server-side wishlist (merges guest localStorage on login), saved shipping addresses, guest order lookup by order number + email ([Phase 4](./phase-060760/04-customer-experience.md))
* Automatic Stripe refund on cancelling a paid order, with admin retry on failure (§6) ([Phase 5](./phase-060760/05-payment-inventory-ops.md))
* Low-stock alert email, Playwright E2E smoke tests, Sentry error monitoring ([Phases 5–6](./phase-060760/00-overview.md))
* Return / RMA workflow with admin review, restock, and Stripe refund on approved returns (§6) ([Phase 7](./phase-060760/07-returns-extended-ops.md))
* Shipment tracking (`tracking_number`, `shipping_carrier`), customer track page (`/orders/track`), admin bulk order status updates ([Phase 7 §7.7](./phase-060760/07-returns-extended-ops.md))

## 14. Not Yet Implemented

Optional follow-ups — no open items from the post-release roadmap at this time. Ideas for a future phase:

* Deeper carrier API integrations (live tracking events vs. external links only)
