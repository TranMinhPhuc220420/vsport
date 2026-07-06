# PERMISSIONS.md

Authorization model for Zova Sport. All enforcement is in the Laravel application layer (middleware + policies) — there is **no database-level RLS** (no Supabase, no Postgres row security). This doc supersedes any earlier Supabase-era design notes.

---

## 1. Roles

Single `role` column on `users` (`App\Enums\UserRole`): `customer` (default) or `admin`. Checked via `$user->isAdmin()` / `$user->isCustomer()` (`App\Models\User`) — never trust a client-supplied role.

### Guest (no session / not logged in)

* Browse PLP/PDP, search, blog, legal pages
* Add to cart, checkout (COD or Stripe) with a required email
* View **only** the order(s) just placed, via `guest_order_access` (see §4)
* Cannot view `/orders` (order history), `/dashboard`, or any `/admin` route

### Customer (`role = customer`)

* Everything a guest can do, plus:
* View own order history and detail (`/orders`, `/orders/{orderNumber}`)
* Leave one review per product, manage profile/security/appearance settings
* Cannot access `/admin/*` (blocked by the `admin` middleware, `403`)
* Cannot view or modify another user's orders (`OrderPolicy`, `403`)

### Admin (`role = admin`)

* Full access to `/admin/*`: products, categories, brands, size guides, orders (view + status transitions), discount codes, reviews (approve), blog, homepage CMS, newsletter subscriber list, analytics, store settings, activity log
* Every mutating admin action is written to `admin_activity_logs`

---

## 2. Enforcement Map

### Middleware (`bootstrap/app.php` aliases)

| Alias | Class | Used for |
|-------|-------|----------|
| `auth` | Laravel built-in | Any route requiring a logged-in user |
| `verified` | Laravel built-in | Routes requiring a verified email (all authenticated storefront + admin routes) |
| `admin` | `App\Http\Middleware\EnsureUserIsAdmin` | Aborts `403` unless `$user->isAdmin()` |
| `ops` | `App\Http\Middleware\EnsureOpsToken` | Token-gated ops endpoints (`/ops/storage-link`, `/ops/clear-cache`) — compares `X-Ops-Token` header/`?token=` against `OPS_TOKEN` env, constant-time |
| `local` | `App\Http\Middleware\EnsureLocalEnvironment` | Non-production-only routes (e.g. `/preview/design-system`) |
| `RequirePassword` (Fortify) | — | `settings/security` requires a recently-confirmed password before viewing (redirects to `password.confirm`) |

### Route groups

| Group | File | Middleware | Notes |
|-------|------|-----------|-------|
| Public storefront | `routes/web.php` | `web` (session, CSRF) only | PLP/PDP, cart, checkout, blog, legal — no auth required |
| `/api/*` (cart, discount validate) | `routes/web.php` | `web` only | Guest-accessible; cart resolves by session, not user |
| Authenticated storefront | `routes/web.php` | `auth`, `verified` | `/orders`, `/orders/{orderNumber}`, `/dashboard`, review submission |
| Settings | `routes/settings.php` | `auth` (profile), `auth`+`verified` (security/appearance/delete) | `security.edit` additionally requires `RequirePassword` |
| Admin | `routes/admin.php` | `auth`, `verified`, `admin` | Every route under `/admin` prefix |
| Stripe webhook | `routes/web.php` | none (verified by Stripe signature inside the controller) | `POST /stripe/webhook` |

### Policies

| Policy | Model | Rules |
|--------|-------|-------|
| `OrderPolicy` | `Order` | `viewAny`: admin only. `view`: admin, or `order.user_id === $user->id`. `update` (status transitions): admin only. |

No other model policies exist yet — admin-only resources (products, categories, brands, discount codes, blog, etc.) are protected entirely by the route-level `admin` middleware, not per-model policies.

No `Gate::define`/`AuthServiceProvider` custom gates are used; policies are resolved by Laravel's model-name convention (`Order` → `OrderPolicy`).

---

## 3. Guest Checkout & Order Recovery

Guests can complete checkout without an account (email is required in the checkout form and stored in the JSON `shipping_address` snapshot on the order).

Immediately after a guest places an order, `CheckoutController::store()` pushes the new `order_number` into the `guest_order_access` session array. `OrderConfirmationController::show()` (`GET /orders/confirmation/{orderNumber}`) allows viewing if either:

* the request is authenticated and `OrderPolicy::view` passes, or
* the request is a guest and the requested order number is present in `session('guest_order_access', [])`

This is **session-scoped only** — a guest who loses their session (different browser/device, cleared cookies) cannot currently recover their order. A durable guest lookup (order number + email) is planned in [Phase 4](./phase-060760/04-customer-experience.md) and is not yet implemented.

The full authenticated order history (`/orders`, `/orders/{orderNumber}` via `OrderHistoryController`) is behind `auth`+`verified` and always uses `OrderPolicy`, regardless of session grants.

---

## 4. Forbidden Actions (verified by tests)

Customer **cannot**:

* Access any `/admin/*` route or perform admin actions (`403`)
* View or update another customer's order (`403` via `OrderPolicy`)
* Update any order's status (admin-only, `403`)

Guest **cannot**:

* View `/orders` or `/dashboard` (redirected to `login`)
* View an order that isn't in their `guest_order_access` session grant (`403`)

See [`tests/Feature/Permissions/PermissionMatrixTest.php`](../tests/Feature/Permissions/PermissionMatrixTest.php) for the executable spec of the above (guest checkout vs. order history, customer vs. admin route access, cross-user order access, blog admin routes).

---

## 5. Security Notes

* Never trust a client-supplied role or ID — always re-check `$user->isAdmin()`/policy on the server for every mutating action.
* `EnsureOpsToken` uses `hash_equals()` for constant-time comparison — do not change to `===`.
* Session cookies (`cart_session_id`, `appearance`, `locale`, `sidebar_state`) are explicitly excluded from encryption (`bootstrap/app.php`) because they're read by client JS; they carry no sensitive data. Everything else is encrypted per Laravel defaults.
* CSRF is enforced by the `web` middleware group on all state-changing routes except the Stripe webhook (verified by Stripe's own signature, not CSRF) — see `validateCsrfTokens(except:)` in `bootstrap/app.php`.
